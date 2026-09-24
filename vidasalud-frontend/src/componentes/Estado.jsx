export function Cargando({ texto = "Cargando…" }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5 gap-2 text-muted">
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span>{texto}</span>
    </div>
  );
}

export function EstadoVacio({ icon = "bi-inbox", mensaje = "Sin datos para mostrar", children }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`}></i>
      <p className="mb-2">{mensaje}</p>
      {children}
    </div>
  );
}

// Unifica el patrón "cargando / sin datos / contenido" de las páginas.
export function EstadoContenido({ cargando, textoCargando = "Cargando…", vacio = false, icono = "bi-inbox", mensaje = "Sin datos para mostrar", accion, children }) {
  if (cargando) return <Cargando texto={textoCargando} />;
  if (vacio) return <EstadoVacio icon={icono} mensaje={mensaje}>{accion}</EstadoVacio>;
  return children;
}