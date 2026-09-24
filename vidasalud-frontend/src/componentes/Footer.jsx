import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="vs-footer">
      <div className="container-fluid" style={{ padding: 0 }}>
        <div className="row g-4">
          <div className="col-md-5">
            <h6 className="d-flex align-items-center gap-2">
              <i className="bi bi-heart-pulse-fill"></i>VidaSalud
            </h6>
            <p className="small mb-0">
              Plataforma unificada de agendamiento para una red de centros de atención
              primaria y clínicas dentales: cupos, sala de espera y trazabilidad en un solo lugar.
            </p>
          </div>
          <div className="col-md-3">
            <h6>Accesos</h6>
            <ul className="list-unstyled small d-grid gap-1">
              <li><Link to="/appointments" className="footer-link">Atenciones</Link></li>
              <li><Link to="/catalog" className="footer-link">Catálogo de prestaciones</Link></li>
              <li><Link to="/reports" className="footer-link">Reportería</Link></li>
              <li><Link to="/audit" className="footer-link">Auditoría</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Contacto</h6>
            <ul className="list-unstyled small d-grid gap-1">
              <li><i className="bi bi-envelope me-2"></i>soporte@vidasalud.cl</li>
              <li><i className="bi bi-telephone me-2"></i>+56 2 2600 1000</li>
              <li><i className="bi bi-geo-alt me-2"></i>Red de 20 centros en Chile</li>
            </ul>
          </div>
        </div>
        <div className="vs-footer-bottom d-flex justify-content-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} VidaSalud · Red de Atención Primaria</span>
          <span>Login corporativo con Azure AD · JWT protegido vía AWS API Gateway</span>
        </div>
      </div>
    </footer>
  );
}