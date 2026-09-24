import { PublicClientApplication } from '@azure/msal-browser';

// Conﬁguración MSAL v2 (Authorization Code + PKCE). Los valores se leen de .env:
//   VITE_MSAL_CLIENT_ID, VITE_MSAL_TENANT_ID, VITE_MSAL_REDIRECT_URI, VITE_MSAL_SCOPES
const clientId = import.meta.env.VITE_MSAL_CLIENT_ID || '';
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID || '';

export const isMsalConfigured = Boolean(clientId && tenantId);

export const msalConfig = {
  auth: {
    clientId,
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : undefined,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: true,
  },
};

// Scopes que debe exponer la API (API Gateway / backend). Por defecto incluye
// los scopes básicos para validar el token de Azure AD.
export const loginRequest = {
  scopes: (import.meta.env.VITE_MSAL_SCOPES || 'openid,profile,email')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

let instance = null;
let initPromise = null;

export function getMsalInstance() {
  if (!isMsalConfigured) return null;
  if (!instance) instance = new PublicClientApplication(msalConfig);
  return instance;
}

// MSAL v5 exige inicializar la instancia (pca.initialize()) antes de usar
// cualquier API (loginRedirect, handleRedirectPromise, etc.). Esta función
// garantiza que se inicialice solo una vez, sin importar quién la pida.
export function initializeMsal() {
  if (!isMsalConfigured) return Promise.resolve(null);
  const msal = getMsalInstance();
  if (!initPromise) {
    initPromise = msal.initialize().catch((e) => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise.then(() => msal);
}

// Mapea los claim `roles` del token de Azure AD (App Roles) a roles internos.
export function mapAzureRolesToInternal(roles = []) {
  const r = roles.map((x) => String(x).toLowerCase());
  if (r.includes('admin') || r.includes('administrador')) return 'admin';
  if (r.includes('auditor')) return 'auditor';
  if (r.includes('operador') || r.includes('recepcionista')) return 'recepcionista';
  return 'paciente';
}

// Perfil de respaldo desde los claims del ID token, útil mientras el endpoint
// /auth/microsoft del backend aùn no está disponible.
export function profileFromClaims(claims = {}) {
  const email = claims.preferred_username || claims.email || claims.upn || 'usuario@microsoft.com';
  const nombre = claims.name || email.split('@')[0] || 'Usuario Microsoft';
  return {
    id: claims.oid || email,
    email,
    nombre,
    rol: mapAzureRolesToInternal(claims.roles),
    centroId: null,
    authProvider: 'azure-ad',
  };
}