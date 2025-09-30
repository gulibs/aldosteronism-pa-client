// app/(your-route)/screening/page.tsx  (or wherever your original page is)
'use client'
import PageContainer from '@renderer/components/page-container'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Input } from '@renderer/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Image } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import aldosteroneImg from '@renderer/assets/aldosterone.png'
import { Icon } from '@iconify/react'

const items = [
  {
    id: 0,
    title: 'Resistant hypertension (≥3 drugs uncontrolled, or requiring ≥4 drugs)',
    score: 3
  },
  { id: 1, title: 'Spontaneous or drug-induced hypokalemia', score: 3 },
  { id: 2, title: 'Severe hypertension (SBP ≥160 or DBP ≥100)', score: 2 },
  { id: 3, title: 'Early-onset hypertension (<40 years)', score: 2 },
  { id: 4, title: 'Adrenal incidentaloma', score: 2 },
  { id: 5, title: 'Family history: early-onset hypertension / PA', score: 2 },
  { id: 6, title: 'Atrial fibrillation, stroke (<40 years), sleep apnea', score: 1 }
]

// Zod schema: keep items required (at least one) and PAC/PRA as optional numeric strings
const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.'
  }),
  pac: z.string().optional(), // PAC (ng/dL)
  pra: z.string().optional() // PRA (ng/mL/h)
})

export default function ScreeningTestPage() {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
      pac: '',
      pra: ''
    }
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    navigate(`/screening-test/results`, {
      state: { pac: data.pac, pra: data.pra, items: data.items }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, () => {
            toast('Please select at least one item', {
              description: 'You need to select at least one item to submit the form.'
            })
          })}
        >
          <PageContainer className="space-y-10">
            <div className="w-full bg-gray-100">
              <Image
                src={aldosteroneImg}
                alt="Aldosterone hero"
                width={1200}
                height={420}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div id="risk-assessment" className="space-x-8">
                <h1 className="w-full text-lg sm:text-xl md:text-2xl font-extrabold text-center text-slate-900">
                  Rapid Screening
                </h1>
                <div className="w-full mt-4 sm:mt-6 space-y-8">
                  <FormField
                    control={form.control}
                    name="items"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Select Items</FormLabel>
                          <FormDescription>
                            In outpatient/physical examinations, items can be quickly selected; each
                            item adds points, resulting in a total clinical risk score.
                          </FormDescription>
                        </div>
                        {items.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="items"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-center gap-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id.toString())}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id.toString()])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id.toString()
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {item.title}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div id="laboratory-results" className="space-x-8">
                <h1 className="w-full mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl font-extrabold text-center text-slate-900">
                  Laboratory Results
                </h1>
                <div className="w-full mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pac"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAC (Plasma Aldosterone Concentration)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input {...field} placeholder="e.g. 15.2" inputMode="decimal" />
                            <span className="ml-3 text-sm text-slate-600">ng/dL</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Plasma aldosterone concentration. Enter numeric value.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PRA (Plasma Renin Activity)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input {...field} placeholder="e.g. 1.5" inputMode="decimal" />
                            <span className="ml-3 text-sm text-slate-600">ng/mL/h</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Plasma renin activity. Enter numeric value.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-left gap-2">
                <Button variant="secondary" type="button" onClick={() => window.history.back()}>
                  <Icon icon="solar:arrow-left-line-duotone" />
                  Go Back
                </Button>
                <Button type="submit">Go to Results</Button>
              </div>
            </div>
          </PageContainer>
        </form>
      </Form>
    </div>
  )
}
