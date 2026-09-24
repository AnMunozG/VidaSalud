import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { AuthProvider } from '../componentes/AuthContext'
import Login from '../paginas/Login'
import { TOKEN_KEY, USER_KEY } from '../servicios/api'

function renderLogin() {
  const router = createMemoryRouter(
    [
      {
        path: '/login',
        element: (
          <AuthProvider>
            <Login />
          </AuthProvider>
        ),
      },
      { path: '/dashboard', element: <div data-testid="destino-dashboard">DASHBOARD</div> },
    ],
    { initialEntries: ['/login'] }
  )
  render(<RouterProvider router={router} />)
}

describe('Login', () => {
  it('muestra el formulario y el botón de Microsoft', () => {
    renderLogin()
    expect(screen.getByRole('heading', { level: 1, name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('nombre@vidasalud.cl')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument()
    // El botón MSAL existe siempre; su etiqueta cambia según haya credenciales en .env.
    const msButton = screen.getByTitle(/cuenta corporativa de Microsoft/i)
    expect(msButton).toBeInTheDocument()
  })

  it('inicia sesión con credenciales demo y redirige al dashboard', async () => {
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('nombre@vidasalud.cl'), {
      target: { value: 'admin@vidasalud.cl' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { value: 'admin123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(window.localStorage.getItem(TOKEN_KEY)).toBeTruthy()
    })
    expect(window.localStorage.getItem(USER_KEY)).toContain('admin')
    expect(await screen.findByTestId('destino-dashboard')).toBeInTheDocument()
  })

  it('muestra error con credenciales incorrectas', async () => {
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('nombre@vidasalud.cl'), {
      target: { value: 'admin@vidasalud.cl' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { value: 'mal-clave' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    const error = await screen.findByText(/incorrectos/i)
    expect(error).toBeInTheDocument()
  })
})