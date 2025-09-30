import { Outlet } from 'react-router'
import { Toaster } from 'sonner'
import Header from './header'

export default function RootLayout() {
  return (
    <>
      <Toaster />
      <Header />
      <Outlet />
    </>
  )
}
