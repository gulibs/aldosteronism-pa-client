import { Button } from '@heroui/react'
import { Image } from '@heroui/react'
import { useNavigate } from 'react-router'
import aldosteroneImg from '../assets/aldosterone.png'
import PageContainer from '../components/page-container'

export default function PrimaryAldosteronePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center p-4">
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

        <div className="p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-slate-900">
            Primary Aldosterone Algorithm
          </h1>

          <p className="mt-4 sm:mt-6 font-light text-sm sm:text-base leading-relaxed text-slate-800 max-w-3xl mx-auto text-center">
            The Primary Aldosteronism (PA) Diagnosis Software is designed to support clinicians in
            the early detection and accurate confirmation of PA. The platform integrates two
            complementary modules: a Screening Module, which rapidly identify patients at high risk,
            and a Diagnosis Module, which guides and organizes confirmatory testing workflows,
            including prediction of uAH vs bAH when tests positive.
          </p>

          <div className="mt-8 flex flex-col gap-4 items-center">
            <Button
              size="lg"
              color="primary"
              className="w-64 sm:w-80 h-14 text-xl"
              aria-label="Screening Test"
              onPress={() => navigate('/screening-test')}
            >
              Screening Test
            </Button>

            <Button
              size="lg"
              color="secondary"
              className="w-64 sm:w-80 h-14 text-xl"
              aria-label="Diagnosis Test"
              onPress={() => navigate('/diagnosis-test')}
            >
              Diagnosis Test
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
