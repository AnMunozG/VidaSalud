export default function CampoFiltro({ label, children }) {
  return (
    <div>
      <label className="form-label fw-semibold small mb-1 d-block">{label}</label>
      {children}
    </div>
  );
}