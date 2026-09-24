import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { AuthProvider } from '../componentes/AuthContext'
import ProtectedRoute from '../componentes/ProtectedRoute'
import { USER_KEY } from '../servicios/api'

function renderRuta(rutaInicial, guard) {
  const router = createMemoryRouter(
    [
      {
        path: '/protegida',
        element: <AuthProvider><ProtectedRoute requiredRole={guard}><div data-testid="contenido">CONTENIDO PROTEGIDO</div></ProtectedRoute></AuthProvider>,
      },
      { path: '/login', element: <div data-testid="login">LOGIN</div> },
      { path: '/dashboard', element: <div data-testid="dashboard">DASHBOARD</div> },
      { path: '/audit', element: <div data-testid="audit">AUDIT</div> },
    ],
    { initialEntries: [rutaInicial] }
  )
  render(<RouterProvider router={router} />)
}

function autenticarComo(rol) {
  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: 'u1', email: 'a@b.cl', nombre: 'Usuario', rol, centroId: null })
  )
}

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay sesión', () => {
    renderRuta('/protegida', ['admin'])
    expect(screen.getByTestId('login')).toBeInTheDocument()
    expect(screen.queryByTestId('contenido')).not.toBeInTheDocument()
  })

  it('permite el acceso al rol autorizado', () => {
    autenticarComo('admin')
    renderRuta('/protegida', ['admin', 'recepcionista'])
    expect(screen.getByTestId('contenido')).toBeInTheDocument()
  })

  it('redirige a /dashboard cuando el rol no tiene permiso', () => {
    autenticarComo('paciente')
    renderRuta('/protegida', ['admin', 'recepcionista'])
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('contenido')).not.toBeInTheDocument()
  })

  it('redirige al auditor a /audit cuando no tiene permiso', () => {
    autenticarComo('auditor')
    renderRuta('/protegida', ['admin', 'recepcionista'])
    expect(screen.getByTestId('audit')).toBeInTheDocument()
  })
})