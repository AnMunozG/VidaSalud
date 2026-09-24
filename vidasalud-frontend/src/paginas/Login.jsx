import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../componentes/AuthContext";
import Marca from "../componentes/Marca";
import { USE_MOCKS } from "../servicios/api.js";
import { ROL_LABELS } from "../api.js";
import { usuariosDemo, BANNERS, fondoBanner } from "../componentes/Datos.js";

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithMicrosoft, msalConfigured, msalReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [msalLoading, setMsalLoading] = useState(false);

  const redirigirPorRol = (rol) => {
    navigate(rol === "auditor" ? "/audit" : "/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Ingresa tu correo corporativo y contraseña.");
      return;
    }
    setLoading(true);
    let usr;
    try {
      usr = await login(email.trim(), password);
    } catch {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    setError("");
    setLoading(false);
    redirigirPorRol(usr.rol);
  };

  const handleMicrosoft = () => {
    if (!msalConfigured || !msalReady) return;
    setError("");
    setMsalLoading(true);
    try {
      loginWithMicrosoft();
      // Tras el redirect el efecto en AuthContext completa el login.
    } catch {
      setMsalLoading(false);
      setError("No se pudo iniciar sesión con Microsoft.");
    }
    setTimeout(() => setMsalLoading(false), 800);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-hero" role="img" aria-label={BANNERS.login.alt} style={{ "--banner-img": fondoBanner(BANNERS.login.seed) }}>
          <div className="auth-hero-inner">
            <Marca extraClase="auth-hero-brand" sub="Atención primaria y odontología" />
            <h1>Iniciar sesión</h1>
            <p>Accede a tu cuenta VidaSalud para gestionar tus atenciones.</p>
          </div>
        </div>

        <div className="auth-form-card">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2">
              <i className="bi bi-exclamation-circle-fill"></i>{error}
            </div>
          )}

          <button
            type="button"
            className="ms-login-btn"
            onClick={handleMicrosoft}
            disabled={!msalConfigured || !msalReady || msalLoading}
            title={
              !msalConfigured
                ? "Configura VITE_MSAL_CLIENT_ID y VITE_MSAL_TENANT_ID en el archivo .env para habilitar"
                : "Iniciar sesión con tu cuenta corporativa de Microsoft"
            }
          >
            <MicrosoftLogo />
            {msalConfigured ? "Iniciar sesión con Microsoft" : "Azure AD aún no configurado (.env)"}
          </button>

          <div className="ms-login-divider">
            <span>o accede con tu correo corporativo</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Correo corporativo</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="nombre@vidasalud.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              <i className="bi bi-box-arrow-in-right me-2"></i>
              {loading ? "Validando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-decoration-underline fw-semibold">Regístrate como paciente</Link>
          </p>

          {USE_MOCKS && (
            <div className="alert mock-alert small mt-4 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              <strong>Modo demo:</strong> prueba con
              {usuariosDemo.map((u, i) => (
                <span key={u.email}>
                  {i > 0 && (i === usuariosDemo.length - 1 ? " o " : ", ")}
                  <span className="badge bg-light text-dark mx-1">{u.email} / {u.password}</span> ({ROL_LABELS[u.rol] || u.rol})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}