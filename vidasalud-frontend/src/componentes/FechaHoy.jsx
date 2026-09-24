import { fechaEsCL } from "../constants.js";

export default function FechaHoy() {
  return (
    <span className="bo-date-badge">
      <i className="bi bi-calendar3 me-1"></i>
      {fechaEsCL()}
    </span>
  );
}