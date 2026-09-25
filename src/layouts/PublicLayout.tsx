import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToHash from '@/components/layout/ScrollToHash'

export default function PublicLayout() {
  return (
    <>
      <ScrollToHash />
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
