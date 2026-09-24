import { ESTADO_COLORS } from "../constants.js";

export default function BadgeEstado({ estado, className = "" }) {
  const color = ESTADO_COLORS[estado] || "#6c757d";
  return (
    <span
      className={`bo-badge badge-dynamic ${className}`}
      style={{
        "--badge-bg": `${color}18`,
        "--badge-color": color,
        "--badge-border": `${color}35`,
      }}
    >
      <span className="estado-dot"></span>
      {estado}
    </span>
  );
}