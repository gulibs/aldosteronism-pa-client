import { createHashRouter } from 'react-router'
import RootLayout from './components/root-layout'
import PrimaryAldosteronePage from './pages/home'
import ScreeningTestPage from './pages/screening-test'
import ScreeningResultsPage from './pages/screening-results'
import DiagnosisTestPage from './pages/diagnosis-test'
import DiagnosisResultsPage from './pages/diagnosis-results'

export const routes = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <PrimaryAldosteronePage />,
        index: true
      },
      {
        path: 'screening-test',
        element: <ScreeningTestPage />
      },
      {
        path: 'diagnosis-test',
        element: <DiagnosisTestPage />
      },
      {
        path: 'screening-test/results',
        element: <ScreeningResultsPage />
      },
      {
        path: 'diagnosis-test/results',
        element: <DiagnosisResultsPage />
      }
    ]
  }
])
