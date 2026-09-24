import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { autenticacionService } from "../api.js";
import { TOKEN_KEY, USER_KEY, AUTH_MODE_KEY } from "../servicios/api.js";
import { initializeMsal, loginRequest, isMsalConfigured, profileFromClaims, claimsFromAccessToken } from "../servicios/msal.js";

const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(leerUsuarioGuardado);
  // msalReady: en tests (vitest) se considera listo de entrada y se omite MSAL.
  const [msalReady, setMsalReady] = useState(!isMsalConfigured || import.meta.env.MODE === 'test');
  const redirectHandled = useRef(false);

  const persistir = (nextUser, token, mode) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (mode) localStorage.setItem(AUTH_MODE_KEY, mode);
  };

  const completarLoginMicrosoft = useCallback(async (accessToken, claims) => {
    let usr;
    try {
      // El backend resuelve el perfil y los roles internos desde el token de Azure AD.
      const res = await autenticacionService.loginMicrosoft(accessToken, claims);
      usr = res.user;
      console.info("[MSAL] Roles del token:", claims?.roles || [], "→ rol interno:", usr?.rol);
      persistir(usr, accessToken, "msal");
    } catch {
      // Fallback con los claims del access token (roles de la API) mientras
      // /auth/microsoft no esté listo.
      usr = profileFromClaims(claims);
      console.info("[MSAL] Roles del token (fallback):", claims?.roles || [], "→ rol interno:", usr?.rol);
      persistir(usr, accessToken, "msal");
    }
    // Redirige al home del rol apenas termina el login de Microsoft.
    navigate(usr.rol === "auditor" ? "/audit" : "/dashboard", { replace: true });
  }, [navigate]);
// Procesa el resultado del redirect de MSAL al volver de login.microsoftonline.com
  useEffect(() => {
    // En tests (vitest) no se inicializa MSAL ni se ejecuta el redirect.
    if (import.meta.env.MODE === 'test') return;
    if (redirectHandled.current) {
      setMsalReady(true);
      return;
    }
    redirectHandled.current = true;
    initializeMsal()
      .then(async (msal) => {
        if (!msal) return;
        const respuesta = await msal.handleRedirectPromise();
        if (respuesta?.account) {
          try {
            const res = await msal.acquireTokenSilent({ ...loginRequest, account: respuesta.account });
            // Roles en el access token de la API (App Roles del registro
            // vidasalud-bff-api); el ID token del SPA no los trae.
            const accessClaims = claimsFromAccessToken(res.accessToken);
            const claims = {
              ...(res.idTokenClaims || respuesta.idTokenClaims || {}),
              ...(accessClaims || {}),
            };
            await completarLoginMicrosoft(res.accessToken, claims);
          } catch (e) {
            console.error("[MSAL] Error al completar login por redirect:", e);
          }
        }
      })
      .catch((e) => console.error("[MSAL] handleRedirectPromise falló:", e))
      .finally(() => setMsalReady(true));
  }, [completarLoginMicrosoft]);

  const login = async (email, password) => {
    const res = await autenticacionService.login(email, password);
    persistir(res.user, res.token, "tradicional");
    return res.user;
  };

  const loginWithMicrosoft = () => {
    initializeMsal()
      .then((msal) => {
        if (!msal) {
          console.error("[MSAL] No configurado: revisa VITE_MSAL_CLIENT_ID y VITE_MSAL_TENANT_ID en .env y reinicia el dev server.");
          return;
        }
        // Redirige al login de Microsoft. Al volver, el useEffect procesa la respuesta.
        msal.loginRedirect(loginRequest).catch((err) => {
          console.error("[MSAL] Error en loginRedirect:", err?.message || err);
        });
      })
      .catch((err) => console.error("[MSAL] Inicialización de MSAL falló:", err?.message || err));
  };

  const logout = async () => {
    const mode = localStorage.getItem(AUTH_MODE_KEY);
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_MODE_KEY);
    autenticacionService.logoutServerSide();
    if (mode === "msal" && isMsalConfigured) {
      initializeMsal()
        .then((msal) => msal?.logoutRedirect({ postLogoutRedirectUri: window.location.origin }))
        .catch((e) => console.error("[MSAL] Error en logoutRedirect:", e));
    }
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    persistir(updated, null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithMicrosoft,
        logout,
        updateUser,
        isAuth: !!user,
        msalReady,
        msalConfigured: isMsalConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}