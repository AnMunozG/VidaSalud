// Constantes y dependencias compartidas por toda la app.

export const ROLES = ["admin", "recepcionista", "paciente", "auditor"];

export const ROL_LABELS = {
  admin: "Administrador",
  recepcionista: "Recepcionista",
  paciente: "Paciente",
  auditor: "Auditor",
};

export const ESTADOS_ATENCION = [
  "Solicitada",
  "Confirmada",
  "En espera",
  "En atención",
  "Cerrada",
  "Cancelada",
];

export const ESTADO_COLORS = {
  "Solicitada": "#6c757d",
  "Confirmada": "#2E86C1",
  "En espera": "#E8A33D",
  "En atención": "#9B59B6",
  "Cerrada": "#2ECC71",
  "Cancelada": "#DD4444",
};

// Transiciones de estado permitidas según el estado actual.
// recepcionista y admin comparten permisos; paciente solo cancela.
// "Cerrada" y "Cancelada" son estados terminales.
export const TRANSICIONES_ESTADO = {
  "Solicitada": ["Confirmada", "Cancelada"],
  "Confirmada": ["En espera", "Cancelada"],
  "En espera": ["En atención", "Cancelada"],
  "En atención": ["Cerrada", "Cancelada"],
  "Cerrada": [],
  "Cancelada": [],
};

export const TIPOS_EVENTO_AUDIT = [
  "LOGIN",
  "LOGOUT",
  "SOLICITUD",
  "CREACION",
  "CONFIRMACION",
  "LLEGADA",
  "INICIO_ATENCION",
  "CERRADA",
  "CANCELACION",
  "EDICION",
];

export const CHART_COLORS = ["#0E7C86", "#4EC3C9", "#0A7E4C", "#E8A33D", "#2E86C1", "#9B59B6", "#DD4444"];

export function getEstadosDisponibles(estado, rol) {
  const base = TRANSICIONES_ESTADO[estado] || [];
  if (rol === "paciente") {
    return base.filter((e) => e === "Cancelada");
  }
  return base;
}

export function formatearFecha(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatearFechaHora(iso, hora) {
  return hora ? `${formatearFecha(iso)} · ${hora}` : formatearFecha(iso);
}

// ── Helpers de fecha compartidos ──────────────────────────

// Fecha de hoy en formato ISO (yyyy-mm-dd).
export function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

// Fecha desplazada N días en formato ISO (offset 0 = hoy).
export function sumarDias(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

// Hora actual en formato HH:mm.
export function horaActual() {
  return new Date().toTimeString().slice(0, 5);
}

// Fecha actual legible en español (ej. "23 de septiembre de 2026").
export function fechaEsCL() {
  return new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" });
}