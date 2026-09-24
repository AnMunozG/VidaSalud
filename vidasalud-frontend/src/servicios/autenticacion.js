import api from './api';
import * as mock from '../componentes/Datos.js';
import { USE_MOCKS } from './api';
import { profileFromClaims } from './msal.js';

// ── Auth ─────────────────────────────────────────────────
export async function login(email, password) {
  if (USE_MOCKS) return mock.mockLogin(email, password);
  return api.post('/auth/login', { email, password });
}

// Alta de paciente sin Azure AD (nombre, correo y contraseña propia).
export async function register(data) {
  if (USE_MOCKS) return mock.mockRegister(data);
  return api.post('/auth/register', data);
}

// Intercambia el access token de Azure AD por perfil + roles en el backend.
// El mismo access token se usa como Bearer en el resto de las llamadas
// (API Gateway lo valida). En modo mock construye el perfil desde los claims
// del ID token para reflejar la identidad real de Entra sobre los datos demo.
export async function loginMicrosoft(accessToken, claims = {}) {
  if (USE_MOCKS) return { token: accessToken, user: profileFromClaims(claims) };
  const res = await api.post('/auth/microsoft', { access_token: accessToken });
  return res;
}

export function logoutServerSide() {
  if (USE_MOCKS) return Promise.resolve();
  return api.post('/auth/logout').catch(() => {});
}