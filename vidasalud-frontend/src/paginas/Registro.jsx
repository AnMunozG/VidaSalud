import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../componentes/AuthContext";
import Marca from "../componentes/Marca";
import { BANNERS, fondoBanner } from "../componentes/Datos.js";

export default function Registro() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ya inició sesión (ej. vuelve al registro con una cuenta abierta).
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const nombre = form.nombre.trim();
    const email = form.email.trim();
    if (!nombre) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await register({ nombre, email, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-hero" role="img" aria-label={BANNERS.login.alt} style={{ "--banner-img": fondoBanner(BANNERS.login.seed) }}>
          <div className="auth-hero-inner">
            <Marca extraClase="auth-hero-brand" sub="Atención primaria y odontología" />
            <h1>Crear cuenta de paciente</h1>
            <p>Regístrate sin Azure AD y agenda tus atenciones con tu correo y contraseña.</p>
          </div>
        </div>

        <div className="auth-form-card">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2">
              <i className="bi bi-exclamation-circle-fill"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Nombre completo</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={set("nombre")}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Correo electrónico</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="nombre@vidasalud.cl"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small">Repite tu contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repite tu contraseña"
                  value={form.confirmar}
                  onChange={set("confirmar")}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              <i className="bi bi-person-plus me-2"></i>
              {loading ? "Creando cuenta…" : "Crear cuenta y entrar"}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-decoration-underline fw-semibold">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}