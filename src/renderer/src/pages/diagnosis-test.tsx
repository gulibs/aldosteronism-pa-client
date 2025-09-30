// src/pages/diagnosis-test.tsx
'use client'
import { Image, Divider } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import aldosteroneImg from '@renderer/assets/aldosterone.png'
import PageContainer from '@renderer/components/page-container'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

const FACTORS = {
  low_potassium: { label: 'Serum potassium <3.5', points: 8 },
  high_sodium: { label: 'Serum sodium >140', points: 1 },
  na_k_ratio: { label: 'Na/K ratio >32', points: 2 },
  ipth: { label: 'iPTH (intact parathyroid hormone)', points: 2 },
  acth: { label: 'ACTH (adrenocorticotropic hormone)', points: 2 },
  arr_gt_20: { label: 'ARR >20', points: 8 },

  age_gt_60: { label: 'Age >60', points: 1 },
  female: { label: 'Gender=female', points: 1 },
  sbp_ge_160: { label: 'Systolic BP ≥160', points: 2 },
  egfr_lt_60: { label: 'Renal function (eGFR) <60', points: 2 },
  cad: { label: 'Coronary artery disease', points: 2 },
  osa: { label: 'Obstructive sleep apnea', points: 2 },

  protein_a: { label: 'Protein A', points: 1 },
  protein_b: { label: 'Protein B', points: 1 },
  protein_c: { label: 'Protein C', points: 1 },

  supplementation: { label: 'Potassium supplementation/symptoms', points: 2 },
  alkalosis: { label: 'Alkaline urine', points: 1 },
  antihypertensive_3plus: { label: 'Use of ≥3 antihypertensive medications', points: 2 }
}

const FormSchema = z.object({
  // Biochemistry / RAAS
  serum_k: z.string().min(1, 'Serum potassium is required'),
  serum_na: z.string().min(1, 'Serum sodium is required'),
  na_k_ratio: z.string().optional(),
  anion_gap: z.string().min(1, 'Anion gap is required'),
  ipth: z.string().min(1, 'iPTH is required'),
  acth: z.string().min(1, 'ACTH is required'),
  pac: z.string().min(1, 'PAC is required'),
  pra: z.string().min(1, 'PRA is required'),
  arr_after_captopril: z.string().min(1, 'ARR after captopril is required'),

  // Clinical
  age: z.string().min(1, 'Age is required'),
  sex: z.enum(['male', 'female']),
  sbp: z.string().min(1, 'Systolic blood pressure is required'),
  dbp: z.string().min(1, 'Diastolic blood pressure is required'),
  egfr: z.string().min(1, 'Renal function (eGFR) is required'),
  cad: z.enum(['yes', 'no']),
  osa: z.enum(['yes', 'no']),

  // Treatment / symptoms
  supplementation: z.enum(['yes', 'no']),
  alkalosis: z.enum(['yes', 'no']),
  antihypertensive_count: z.string().min(1, 'Number of antihypertensive medications is required'),

  // Proteins
  protein_a: z.boolean(),
  protein_b: z.boolean(),
  protein_c: z.boolean()
})

type DiagnosisModuleProps = {
  title: string
  children?: React.ReactNode
}

function DiagnosisModule({ title, children }: DiagnosisModuleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <Divider />
      </div>
      {children}
    </div>
  )
}

export default function DiagnosisTestPage() {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      serum_k: '',
      serum_na: '',
      na_k_ratio: '',
      anion_gap: '',
      ipth: '',
      acth: '',
      pac: '',
      pra: '',
      arr_after_captopril: '',
      age: '',
      sex: 'male', // Default to male
      sbp: '',
      dbp: '',
      egfr: '',
      cad: 'no',
      osa: 'no',
      supplementation: 'no',
      alkalosis: 'no',
      antihypertensive_count: '',
      protein_a: false,
      protein_b: false,
      protein_c: false
    }
  })

  // Watch for changes in serum sodium and potassium to auto-calculate Na/K ratio
  const serum_k = form.watch('serum_k')
  const serum_na = form.watch('serum_na')

  // Auto-calculate and update na_k_ratio when serum_k or serum_na changes
  useEffect(() => {
    const k = parseFloat(serum_k || '0')
    const na = parseFloat(serum_na || '0')
    if (k > 0 && !isNaN(na) && !isNaN(k)) {
      const ratio = na / k
      form.setValue('na_k_ratio', ratio.toFixed(2))
    } else {
      form.setValue('na_k_ratio', '')
    }
  }, [serum_k, serum_na, form])

  const computeScore = (
    values: z.infer<typeof FormSchema>
  ): {
    total: number
    breakdown: Array<{
      key: string
      label: string
      points: number
    }>
    arrValue: number
    riskCategory: string
  } => {
    let total = 0
    const breakdown: Array<{ key: string; label: string; points: number }> = []

    const k = parseFloat(values.serum_k || 'NaN')
    const na = parseFloat(values.serum_na || 'NaN')
    const na_k_ratio_input = values.na_k_ratio ? parseFloat(values.na_k_ratio) : NaN
    const pac = parseFloat(values.pac || 'NaN')
    const pra = parseFloat(values.pra || 'NaN')
    const arr_after = parseFloat(values.arr_after_captopril || 'NaN')
    const egfr = parseFloat(values.egfr || 'NaN')
    const age = parseFloat(values.age || 'NaN')
    const sbp = parseFloat(values.sbp || 'NaN')
    const antihypertensive_count = parseInt(values.antihypertensive_count || '0') || 0

    // Electrolyte / RAAS checks
    if (!Number.isNaN(k) && k < 3.5) {
      total += FACTORS.low_potassium.points
      breakdown.push({
        key: 'low_potassium',
        label: FACTORS.low_potassium.label,
        points: FACTORS.low_potassium.points
      })
    }
    if (!Number.isNaN(na) && na > 140) {
      total += FACTORS.high_sodium.points
      breakdown.push({
        key: 'high_sodium',
        label: FACTORS.high_sodium.label,
        points: FACTORS.high_sodium.points
      })
    }

    // Na/K ratio: prefer explicit input, otherwise compute
    const computed_na_k = !Number.isNaN(na) && !Number.isNaN(k) && k !== 0 ? na / k : NaN
    const na_k_to_check = !Number.isNaN(na_k_ratio_input) ? na_k_ratio_input : computed_na_k
    if (!Number.isNaN(na_k_to_check) && na_k_to_check > 32) {
      total += FACTORS.na_k_ratio.points
      breakdown.push({
        key: 'na_k_ratio',
        label: FACTORS.na_k_ratio.label,
        points: FACTORS.na_k_ratio.points
      })
    }

    if (values.ipth) {
      total += FACTORS.ipth.points
      breakdown.push({ key: 'ipth', label: FACTORS.ipth.label, points: FACTORS.ipth.points })
    }
    if (values.acth) {
      total += FACTORS.acth.points
      breakdown.push({ key: 'acth', label: FACTORS.acth.label, points: FACTORS.acth.points })
    }

    // ARR check: compute from PAC/PRA if available; if not, use arr_after
    let arrValue = NaN
    if (!Number.isNaN(pac) && !Number.isNaN(pra) && pra !== 0) {
      arrValue = pac / pra
    } else if (!Number.isNaN(arr_after)) {
      arrValue = arr_after
    }
    if (!Number.isNaN(arrValue) && arrValue > 20) {
      total += FACTORS.arr_gt_20.points
      breakdown.push({
        key: 'arr_gt_20',
        label: FACTORS.arr_gt_20.label,
        points: FACTORS.arr_gt_20.points
      })
    }

    // Clinical
    if (!Number.isNaN(age) && age > 60) {
      total += FACTORS.age_gt_60.points
      breakdown.push({
        key: 'age_gt_60',
        label: FACTORS.age_gt_60.label,
        points: FACTORS.age_gt_60.points
      })
    }
    if (values.sex === 'female') {
      total += FACTORS.female.points
      breakdown.push({ key: 'female', label: FACTORS.female.label, points: FACTORS.female.points })
    }
    if (!Number.isNaN(sbp) && sbp >= 160) {
      total += FACTORS.sbp_ge_160.points
      breakdown.push({
        key: 'sbp_ge_160',
        label: FACTORS.sbp_ge_160.label,
        points: FACTORS.sbp_ge_160.points
      })
    }
    if (!Number.isNaN(egfr) && egfr < 60) {
      total += FACTORS.egfr_lt_60.points
      breakdown.push({
        key: 'egfr_lt_60',
        label: FACTORS.egfr_lt_60.label,
        points: FACTORS.egfr_lt_60.points
      })
    }
    if (values.cad) {
      total += FACTORS.cad.points
      breakdown.push({ key: 'cad', label: FACTORS.cad.label, points: FACTORS.cad.points })
    }
    if (values.osa) {
      total += FACTORS.osa.points
      breakdown.push({ key: 'osa', label: FACTORS.osa.label, points: FACTORS.osa.points })
    }

    // Proteins
    if (values.protein_a) {
      total += FACTORS.protein_a.points
      breakdown.push({
        key: 'protein_a',
        label: FACTORS.protein_a.label,
        points: FACTORS.protein_a.points
      })
    }
    if (values.protein_b) {
      total += FACTORS.protein_b.points
      breakdown.push({
        key: 'protein_b',
        label: FACTORS.protein_b.label,
        points: FACTORS.protein_b.points
      })
    }
    if (values.protein_c) {
      total += FACTORS.protein_c.points
      breakdown.push({
        key: 'protein_c',
        label: FACTORS.protein_c.label,
        points: FACTORS.protein_c.points
      })
    }

    // Treatment / symptoms
    if (values.supplementation) {
      total += FACTORS.supplementation.points
      breakdown.push({
        key: 'supplementation',
        label: FACTORS.supplementation.label,
        points: FACTORS.supplementation.points
      })
    }
    if (values.alkalosis) {
      total += FACTORS.alkalosis.points
      breakdown.push({
        key: 'alkalosis',
        label: FACTORS.alkalosis.label,
        points: FACTORS.alkalosis.points
      })
    }
    if (antihypertensive_count >= 3) {
      total += FACTORS.antihypertensive_3plus.points
      breakdown.push({
        key: 'antihypertensive_3plus',
        label: FACTORS.antihypertensive_3plus.label,
        points: FACTORS.antihypertensive_3plus.points
      })
    }

    // Risk stratification based on total score
    const riskCategory = total >= 15 ? '阳性' : '阴性'

    return { total, breakdown, arrValue, riskCategory }
  }

  const onSubmit = (values: z.infer<typeof FormSchema>): void => {
    const result = computeScore(values)
    navigate('/diagnosis-test/results', { state: { inputs: values, ...result } })
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <h1 className="text-2xl font-extrabold text-center">Diagnosis Input</h1>
              <DiagnosisModule title="Biochemistry/RAAS">
                <FormField
                  control={form.control}
                  name="serum_k"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serum potassium (mmol/L)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 3.4"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serum_na"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serum sodium (mmol/L)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 142"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="na_k_ratio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Na/K ratio (serum sodium/serum potassium)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 34"
                          inputMode="decimal"
                          type="number"
                          value={field.value}
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anion_gap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anion gap (mmol/L)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 12"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ipth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>iPTH (intact parathyroid hormone)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 35"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ACTH (adrenocorticotropic hormone)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 20"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAC (ng/dL)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 18.0"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Plasma aldosterone concentration</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PRA (ng/mL/h)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 0.9"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Plasma renin activity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arr_after_captopril"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        ARR after 50 mg captopril challenge test (ng/dL per (ng/mL·h⁻¹))
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 18"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>ARR after captopril challenge test</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DiagnosisModule>

              <DiagnosisModule title="Clinical Parameters">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Yrs)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 65"
                          inputMode="numeric"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SBP (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 165"
                          inputMode="numeric"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dbp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBP (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 95"
                          inputMode="numeric"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="egfr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renal function (eGFR) (mL/min/1.73m²)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 75"
                          inputMode="decimal"
                          type="number"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*[.]?[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cad"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Coronary artery disease</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="osa"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Obstructive sleep apnea</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DiagnosisModule>

              <DiagnosisModule title="Treatment/Symptoms">
                <FormField
                  control={form.control}
                  name="supplementation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Potassium supplementation</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alkalosis"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Alkaline urine</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="antihypertensive_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of antihypertensive medications</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="e.g. 3"
                          inputMode="numeric"
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value
                            if (value && !/^[0-9]*$/.test(value)) {
                              ;(e.target as HTMLInputElement).value = value.slice(0, -1)
                              field.onChange((e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Please enter the number of different classes of antihypertensive medications
                        the patient is taking.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DiagnosisModule>

              <DiagnosisModule title="Potential Protein Markers">
                <FormField
                  control={form.control}
                  name="protein_a"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                        />
                      </FormControl>
                      <FormLabel>Protein A</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="protein_b"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                        />
                      </FormControl>
                      <FormLabel>Protein B</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="protein_c"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                        />
                      </FormControl>
                      <FormLabel>Protein C</FormLabel>
                    </FormItem>
                  )}
                />
              </DiagnosisModule>
              <div className="flex justify-left gap-2">
                <Button variant="secondary" type="button" onClick={() => window.history.back()}>
                  <Icon icon="solar:arrow-left-line-duotone" />
                  Go Back
                </Button>
                <Button type="submit">Calculate Diagnosis Score</Button>
              </div>
            </div>
          </PageContainer>
        </form>
      </Form>
    </div>
  )
}
