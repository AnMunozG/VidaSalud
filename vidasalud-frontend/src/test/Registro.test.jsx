import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, it, expect } from 'vitest'
import { AuthProvider } from '../componentes/AuthContext'
import Registro from '../paginas/Registro'
import { TOKEN_KEY, USER_KEY } from '../servicios/api'

function renderRegistro() {
  const router = createMemoryRouter(
    [
      {
        path: '/register',
        element: (
          <AuthProvider>
            <Registro />
          </AuthProvider>
        ),
      },
      { path: '/dashboard', element: <div data-testid="destino-dashboard">DASHBOARD</div> },
    ],
    { initialEntries: ['/register'] }
  )
  render(<RouterProvider router={router} />)
}

describe('Registro de paciente (sin Azure AD)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('muestra el formulario de registro', () => {
    renderRegistro()
    expect(screen.getByRole('heading', { level: 1, name: 'Crear cuenta de paciente' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('nombre@vidasalud.cl')).toBeInTheDocument()
  })

  it('valida los campos obligatorios', () => {
    renderRegistro()
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta y entrar/i }))
    expect(screen.getByText('Ingresa tu nombre completo.')).toBeInTheDocument()
  })

  it('valida que las contraseñas coincidan', () => {
    renderRegistro()
    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Lucía Pérez' } })
    fireEvent.change(screen.getByPlaceholderText('nombre@vidasalud.cl'), { target: { value: 'lucia@vidasalud.cl' } })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), { target: { value: 'clave123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'otra-clave' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta y entrar/i }))
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('registra un paciente, lo deja iniciado y lo redirige al dashboard', async () => {
    renderRegistro()
    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Lucía Pérez' } })
    fireEvent.change(screen.getByPlaceholderText('nombre@vidasalud.cl'), { target: { value: `lucia-${Date.now()}@vidasalud.cl` } })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), { target: { value: 'clave123' } })
    fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { target: { value: 'clave123' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta y entrar/i }))

    await waitFor(() => {
      expect(window.localStorage.getItem(USER_KEY)).toContain('lucia')
    })
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeTruthy()
    expect(await screen.findByTestId('destino-dashboard')).toBeInTheDocument()
  })
})