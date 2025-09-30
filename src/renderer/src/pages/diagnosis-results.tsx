// src/pages/diagnosis-results.tsx
'use client'
import PageContainer from '@renderer/components/page-container'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@renderer/components/ui/card'
import { useLocation } from 'react-router'
import { useMemo, useState, useEffect } from 'react'
import { Image } from '@heroui/react'
import aldosteroneImg from '@renderer/assets/aldosterone.png'
import { Icon } from '@iconify/react'
import { Shimmer } from '@renderer/components/shimmer'

const POSITIVE_THRESHOLD_LOCAL = 15 // note: inclusive or exclusive? adjust below if needed

export default function DiagnosisResultsPage() {
  const location = useLocation()
  const state = (location.state as any) || {}

  const total = state?.total ?? NaN
  const inputs = state?.inputs ?? {}
  const arrValue = state?.arrValue ?? NaN

  // State for model prediction
  const [prediction, setPrediction] = useState<any>(null)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  // Call model prediction function
  const callModelPrediction = async () => {
    setIsPredicting(true)
    setPredictionError(null)

    try {
      // Preload should expose getTempDir and writeFile (see preload/index.ts)
      if (!window.electron?.getTempDir || !window.electron?.writeFile) {
        throw new Error('IPC API (electron.getTempDir / writeFile) is not available from preload')
      }

      const tempDir = await window.electron.getTempDir()
      const csvPath = `${tempDir}/prediction_input.csv`

      await window.electron.writeFile(csvPath, inputsToCSV())

      // Call model prediction via window.api.model.predict (also from preload)
      if (!window.api?.model?.predict) {
        throw new Error('Model prediction API (window.api.model.predict) not available')
      }

      const result = await window.api.model.predict({ csvPath })
      setPrediction(result)
    } catch (error: any) {
      setPredictionError(error?.message ?? String(error))
    } finally {
      setIsPredicting(false)
    }
  }
  const classification = useMemo(() => {
    if (!Number.isFinite(total)) return { label: 'Indeterminate', detail: 'Insufficient data' }
    // if you want 15 -> negative and only >15 positive, change >= to >
    if (total >= POSITIVE_THRESHOLD_LOCAL)
      return {
        label: 'Positive',
        detail: `Score ≥ ${POSITIVE_THRESHOLD_LOCAL} → Indicates disease presence`
      }
    return {
      label: 'Negative',
      detail: `Score < ${POSITIVE_THRESHOLD_LOCAL} → Does not indicate disease presence`
    }
  }, [total])

  // Function to convert inputs to CSV format
  const inputsToCSV = (): string => {
    // Map of input fields to CSV columns
    const csvData = {
      Age: inputs.age ?? '',
      Gender: inputs.sex === 'female' ? 2 : 1,
      SBP: inputs.sbp ?? '',
      DBP: inputs.dbp ?? '',
      ARR: Number.isFinite(arrValue) ? arrValue : '',
      K: inputs.serum_k ?? '',
      'ARR-50mg': inputs.arr_after_captopril ?? '',
      'Anti-agents': inputs.antihypertensive_count ?? '0'
    }

    // Create CSV string
    const headers = Object.keys(csvData).join(',')
    const values = Object.values(csvData).join(',')
    return `${headers}\n${values}`
  }

  // Call model prediction when result is positive
  useEffect(() => {
    if (classification.label !== 'Positive') return

    if (!prediction && !predictionError && !isPredicting) {
      callModelPrediction()
    }
  }, [classification.label, prediction, predictionError, isPredicting])

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <PageContainer className="space-y-8">
        <div className="w-full bg-gray-100">
          <Image
            src={aldosteroneImg}
            alt="Aldosterone hero"
            width={1200}
            height={420}
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Results</CardTitle>
              <CardDescription>Comprehensive analysis based on input parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="@container/card">
                  <CardHeader>
                    <CardTitle>Total Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary-500 mb-2">
                      {Number.isFinite(total) ? total : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardTitle>Diagnosis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {classification.label === 'Positive' ? (
                        <span className="text-destructive">{classification.label}</span>
                      ) : (
                        <span className="text-success">{classification.label}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {classification.label === 'Positive' && (
                <div className="mt-4 pt-4 border-t">
                  {isPredicting ? (
                    <div className="space-y-2">
                      <div className="text-lg font-medium">Diagnosis Conclusion</div>
                      <div className="flex flex-col justify-center items-center gap-4 text-sm text-muted-foreground border border-gray-50 bg-gray-100 p-3">
                        <Icon className="text-2xl text-blue-500" icon="eos-icons:bubble-loading" />
                        <Shimmer
                          direction="left"
                          className="text-sm text-zinc-600 dark:text-gray-400 !bg-clip-text"
                        >
                          Analyzing...
                        </Shimmer>
                      </div>
                    </div>
                  ) : predictionError ? (
                    <div className="space-y-2">
                      <div className="text-sm text-destructive">
                        Prediction failed: {predictionError}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={callModelPrediction}
                        className="text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : prediction && prediction.success ? (
                    <div className="space-y-2">
                      <div className="text-lg font-medium">Diagnosis Conclusion</div>
                      <div className="text-lg font-semibold p-3 rounded-md text-center border border-gray-50 bg-gray-100">
                        Patient is <span className="text-destructive">{classification.label}</span>,
                        and subtype belongs to{' '}
                        <span className="text-amber-400">{prediction.results}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <CardFooter className="flex flex-col items-start gap-2 text-sm">
                <div className="flex gap-2">
                  <Button onClick={() => window.history.back()}>Back to Form</Button>
                </div>
              </CardFooter>
            </CardFooter>
          </Card>
        </div>
      </PageContainer>
    </div>
  )
}
