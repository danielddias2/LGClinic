import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Home from '@/pages/Home'
import Agendamento from '@/pages/Agendamento'
import Loader from '@/components/ui/Loader'

// Lazy-loaded routes for code-splitting and performance
const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminAgenda = lazy(() => import('@/pages/admin/Agenda'))
const AdminClientes = lazy(() => import('@/pages/admin/Clientes'))
const AdminServicos = lazy(() => import('@/pages/admin/Servicos'))
const AdminConfiguracoes = lazy(() => import('@/pages/admin/Configuracoes'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <Loader label="Carregando..." />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="agendamento" element={<Agendamento />} />
          </Route>

          {/* Admin login (no layout guard) */}
          <Route path="admin/login" element={<AdminLogin />} />

          {/* Protected admin routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="agenda" element={<AdminAgenda />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="servicos" element={<AdminServicos />} />
            <Route path="configuracoes" element={<AdminConfiguracoes />} />
          </Route>

          {/* 404 Not Found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
