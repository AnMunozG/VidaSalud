export default function BadgeBloqueado({ activo, textoActivo = "Activo", textoInactivo = "Inactivo" }) {
  return (
    <span
      className="bo-badge badge-dynamic"
      style={{
        "--badge-bg": activo ? "rgba(10,126,76,0.12)" : "rgba(108,117,125,0.12)",
        "--badge-color": activo ? "#0A7E4C" : "#6c757d",
        "--badge-border": `${activo ? "#0A7E4C" : "#6c757d"}35`,
      }}
    >
      {activo ? textoActivo : textoInactivo}
    </span>
  );
}