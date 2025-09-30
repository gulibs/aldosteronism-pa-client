import { Image } from '@heroui/react'
import aldosteroneImg from '@renderer/assets/aldosterone.png'
import PageContainer from '@renderer/components/page-container'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

const ITEMS_DEF = [
  { id: 0, title: 'Resistant Hypertension (≥3 drugs ineffective or ≥4 drugs needed)', score: 3 },
  { id: 1, title: 'Spontaneous or drug-induced hypokalemia', score: 3 },
  { id: 2, title: 'Severe Hypertension (SBP ≥160 or DBP ≥100)', score: 2 },
  { id: 3, title: 'Early-onset Hypertension (<40 years)', score: 2 },
  { id: 4, title: 'Adrenal Incidentaloma', score: 2 },
  {
    id: 5,
    title: 'Family History: Early-onset Hypertension / Primary Aldosteronism (PA)',
    score: 2
  },
  { id: 6, title: 'Atrial Fibrillation, Young Stroke (<40 years), Sleep Apnea', score: 1 }
]

const CUT_OFF_ARR = 30 // ARR threshold
const PAC_THRESHOLD = 15 // PAC threshold (ng/dL)

type BadgeInfo = {
  text: string
  variant: 'destructive' | 'secondary' | 'outline' | 'default' | null | undefined
}

export default function ScreeningResultsPage() {
  const location = useLocation()
  const [parsed, setParsed] = useState({ pac: '', pra: '', items: [] as string[] })

  useEffect(() => {
    const data = location.state
    setParsed(data)
  }, [])

  const pacNum = useMemo(() => {
    const v = parseFloat(parsed.pac)
    return Number.isFinite(v) ? v : NaN
  }, [parsed.pac])

  const praNum = useMemo(() => {
    const v = parseFloat(parsed.pra)
    return Number.isFinite(v) ? v : NaN
  }, [parsed.pra])

  const pacProvided = parsed.pac !== '' && !Number.isNaN(pacNum)
  const praProvided = parsed.pra !== '' && !Number.isNaN(praNum)

  const selectedIds = parsed.items.map((s) => Number(s)).filter((n) => !Number.isNaN(n))
  const totalScore = selectedIds.reduce(
    (s, id) => s + (ITEMS_DEF.find((x) => x.id === id)?.score ?? 0),
    0
  )

  const arrValue = useMemo(() => {
    if (praProvided && praNum === 0) return Infinity
    if (pacProvided && praProvided && praNum !== 0) return pacNum / praNum
    return NaN
  }, [pacProvided, praProvided, pacNum, praNum])

  const arrDisplay = useMemo(() => {
    if (arrValue === Infinity) return 'Not Detectable / ∞'
    if (!Number.isFinite(arrValue)) return 'N/A'
    return arrValue.toFixed(2)
  }, [arrValue])

  const hasHypokalemia = selectedIds.includes(1)
  const arrGeCutoff = useMemo(() => {
    if (arrValue === Infinity) return true
    if (!Number.isFinite(arrValue)) return false
    return arrValue >= CUT_OFF_ARR
  }, [arrValue])

  const classification = useMemo(() => {
    const score = totalScore

    if (score >= 5) {
      if (arrGeCutoff) {
        return {
          level: 'High Clinical Risk',
          description: `Highly suspicious for PA, recommend referral/confirmatory test`
        }
      }
      if ((pacProvided && pacNum >= PAC_THRESHOLD) || hasHypokalemia) {
        return {
          level: 'High Clinical Risk',
          description: `but PAC ≥15 ng/dL or repeated hypokalemia → Further assessment recommended`
        }
      }
      return {
        level: 'High Clinical Risk',
        description: `Follow-up/recheck (repeat after stopping medications if necessary)`
      }
    }

    if (score >= 3 && score <= 4) {
      if (arrGeCutoff)
        return {
          level: 'Intermediate Clinical Risk',
          description: `Suspected PA, recommend confirmatory test`
        }
      return {
        level: 'Intermediate Clinical Risk',
        description: `Follow-up/recheck (repeat after stopping medications if necessary)`
      }
    }

    if (score >= 0 && score <= 2) {
      if (arrGeCutoff)
        return {
          level: 'Low Clinical Risk',
          description: `Some possibility, consider repeat ARR or referral`
        }
      return { level: 'Low Clinical Risk', description: `Low suspicion, routine follow-up` }
    }

    return { level: 'Undetermined', description: 'Insufficient or invalid data' }
  }, [totalScore, arrGeCutoff, pacProvided, pacNum, hasHypokalemia])

  const badge: BadgeInfo = useMemo(() => {
    if (classification.level.includes('High')) return { text: 'HIGH', variant: 'destructive' }
    if (classification.level.includes('Intermediate'))
      return { text: 'INTERMEDIATE', variant: 'secondary' }
    return { text: 'LOW', variant: 'outline' }
  }, [classification])

  return (
    <div className="flex flex-col items-center p-4">
      <PageContainer>
        <div className="w-full bg-gray-100">
          <Image
            src={aldosteroneImg}
            alt="Aldosterone hero"
            width={1200}
            height={420}
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <h1 className="text-3xl font-extrabold text-center">Screening Results</h1>

          {/* Top Row: Clinical Score + Laboratory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clinical Score Card */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Clinical Score</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {totalScore} pts
                </CardTitle>
                <CardAction>
                  <Badge variant={badge.variant}>
                    <TrendingUp className="mr-1" size={14} />
                    {badge.text}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {/* Optionally add more info */}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="flex gap-2 font-medium">Selected: {selectedIds.length} items</div>
              </CardFooter>
            </Card>

            {/* Laboratory Card */}
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Laboratory</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {arrDisplay}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">ARR</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    PAC: <strong>{pacProvided ? pacNum : 'Not Provided'}</strong> ng/dL
                  </div>
                  <div className="text-sm">
                    PRA:{' '}
                    <strong>{praProvided ? (praNum === 0 ? '0' : praNum) : 'Not Provided'}</strong>{' '}
                    ng/mL/h
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">If PRA = 0, ARR is Not Detectable / ∞</div>
              </CardFooter>
            </Card>
          </div>

          {/* Bottom Row: Recommendation */}
          <div className="grid grid-cols-1">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Assessment</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {classification.level}
                </CardTitle>
                <CardAction>
                  <Badge variant="secondary">{badge.text}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{classification.description}</div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 text-sm">
                <div className="flex gap-2">
                  <Button onClick={() => window.history.back()}>Back to Form</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
