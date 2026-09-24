import Modal from "./Modal";

// Modal con formulario: cuerpo (children), alerta de error y pie con Cancelar/Guardar.
export default function ModalFormulario({
  show,
  onClose,
  title,
  size,
  onSubmit,
  error,
  guardando = false,
  textoGuardar = "Guardar",
  textoGuardando = "Guardando…",
  icono,
  children,
}) {
  return (
    <Modal show={show} onClose={onClose} title={title} size={size}>
      <form onSubmit={onSubmit}>
        {error && <div className="alert alert-danger small py-2"><i className="bi bi-exclamation-circle-fill me-1"></i>{error}</div>}
        {children}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {icono && <i className={`bi ${icono} me-1`}></i>}
            {guardando ? textoGuardando : textoGuardar}
          </button>
        </div>
      </form>
    </Modal>
  );
}