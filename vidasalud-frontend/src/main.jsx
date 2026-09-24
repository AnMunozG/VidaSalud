/* eslint-disable react-refresh/only-export-components */
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles.css'

import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'

import { AuthProvider } from './componentes/AuthContext.jsx'
import Header from './componentes/Header.jsx'
import Footer from './componentes/Footer.jsx'
import ProtectedRoute from './componentes/ProtectedRoute.jsx'

const Login = lazy(() => import('./paginas/Login.jsx'))
const Registro = lazy(() => import('./paginas/Registro.jsx'))
const Inicio = lazy(() => import('./paginas/Inicio.jsx'))
const Dashboard = lazy(() => import('./paginas/Dashboard.jsx'))
const Atenciones = lazy(() => import('./paginas/Atenciones.jsx'))
const Catalogo = lazy(() => import('./paginas/Catalogo.jsx'))
const Reportes = lazy(() => import('./paginas/Reportes.jsx'))
const Auditoria = lazy(() => import('./paginas/Auditoria.jsx'))

// Vuelve al inicio de la página al navegar entre rutas.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const Layout = () => (
  <>
    <ScrollToTop />
    <AuthProvider>
      <Header />
      <Outlet />
      <Footer />
    </AuthProvider>
  </>
)

const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100 text-muted"><div className="spinner-border" role="status" aria-hidden="true"></div></div>}>
        <Layout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Inicio /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Registro /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredRole={['admin', 'recepcionista', 'paciente']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'appointments',
        element: (
          <ProtectedRoute requiredRole={['admin', 'recepcionista', 'paciente']}>
            <Atenciones />
          </ProtectedRoute>
        ),
      },
      {
        path: 'catalog',
        element: (
          <ProtectedRoute requiredRole={['admin', 'recepcionista']}>
            <Catalogo />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredRole={['admin']}>
            <Reportes />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit',
        element: (
          <ProtectedRoute requiredRole={['admin', 'auditor']}>
            <Auditoria />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <PaginaNoEncontrada /> },
    ],
  },
])

function PaginaNoEncontrada() {
  return (
    <div className="app-page app-page-narrow text-center py-5">
      <i className="bi bi-search" style={{ fontSize: '3rem', color: 'var(--border)' }}></i>
      <h1 className="mt-3">404 — Página no encontrada</h1>
      <p className="c-muted">La ruta que buscas no existe o no tienes acceso a ella.</p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)