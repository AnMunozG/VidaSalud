import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Marca from "./Marca";
import Modal from "./Modal";
import { ROL_LABELS } from "../constants.js";

const NAV_POR_ROL = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { to: "/appointments", label: "Atenciones", icon: "bi-calendar2-check-fill" },
    { to: "/catalog", label: "Catálogo", icon: "bi-box-seam-fill" },
    { to: "/reports", label: "Reportería", icon: "bi-bar-chart-fill" },
    { to: "/audit", label: "Auditoría", icon: "bi-shield-lock-fill" },
  ],
  recepcionista: [
    { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { to: "/appointments", label: "Atenciones", icon: "bi-calendar2-check-fill" },
    { to: "/catalog", label: "Catálogo", icon: "bi-box-seam-fill" },
  ],
  paciente: [
    { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { to: "/appointments", label: "Mis atenciones", icon: "bi-calendar2-check-fill" },
  ],
  auditor: [{ to: "/audit", label: "Auditoría", icon: "bi-shield-lock-fill" }],
};

const NAV_PUBLICO = [{ to: "/", label: "Inicio", icon: "bi-house-door" }];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra los menús al navegar entre rutas.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cierre de menús al navegar
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const cerrar = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const navItems = user ? NAV_POR_ROL[user.rol] || [] : [];

  const handleLogout = async () => {
    setLogoutConfirm(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="vs-header">
      <nav className="navbar navbar-expand-md" aria-label="Navegación principal">
        <Marca to={isAuth ? "/dashboard" : "/"} ocultarEnMovil />

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="vsNavbar"
          aria-expanded={menuOpen}
          aria-label="Alternar navegación"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${menuOpen ? " show" : ""}`} id="vsNavbar">
          <ul className="navbar-nav me-auto vs-nav">
            {isAuth
              ? navItems.map((item) => (
                  <li className="nav-item" key={item.to}>
                    <Link
                      to={item.to}
                      className={`nav-link${pathname === item.to ? " active" : ""}`}
                    >
                      <i className={`bi ${item.icon} me-1`}></i>
                      {item.label}
                    </Link>
                  </li>
                ))
              : NAV_PUBLICO.map((item) => (
                  <li className="nav-item" key={item.to}>
                    <Link
                      to={item.to}
                      className={`nav-link${pathname === item.to ? " active" : ""}`}
                    >
                      <i className={`bi ${item.icon} me-1`}></i>
                      {item.label}
                    </Link>
                  </li>
                ))}
          </ul>

          <div className="header-actions d-flex align-items-center gap-2 ms-auto">
            {!isAuth ? (
              <>
                <Link to="/register" className="btn btn-outline-primary d-none d-sm-inline-block">
                  <i className="bi bi-person-plus me-1"></i>Regístrate
                </Link>
                <Link to="/login" className="btn btn-primary">
                  <i className="bi bi-box-arrow-in-right me-1"></i>Iniciar sesión
                </Link>
              </>
            ) : (
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="btn btn-accent dropdown-toggle d-flex align-items-center gap-2 user-dropdown-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="d-none d-md-inline">{user.nombre || "Usuario"}</span>
                </button>
                {dropdownOpen && (
                  <ul className="dropdown-menu dropdown-menu-end show user-dropdown-menu">
                    <li className="px-3 py-2">
                      <div className="fw-semibold c-heading">{user.nombre}</div>
                      <div className="small text-muted">{user.email}</div>
                      <span className="badge bg-accent mt-1">{ROL_LABELS[user.rol] || user.rol}</span>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button type="button" className="dropdown-item" onClick={() => setLogoutConfirm(true)}>
                        <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <Modal
        show={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="Cerrar sesión"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setLogoutConfirm(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Cerrar sesión
            </button>
          </>
        }
      >
        <p className="mb-0">¿Deseas cerrar tu sesión en VidaSalud?</p>
      </Modal>
    </header>
  );
}