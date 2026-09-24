export default function Modal({ show, onClose, title, children, footer, size = "" }) {
  if (!show) return null;
  return (
    <div className="modal d-block modal-overlay" tabIndex="-1" role="dialog" aria-modal="true">
      <div className={`modal-dialog modal-dialog-centered ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}