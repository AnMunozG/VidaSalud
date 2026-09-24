// Almacenamiento local de datos mientras no exista backend ni base de datos.
// Contiene el contenido estático de la UI y la capa de datos simulados (demo).

import { sumarDias, horaActual } from "../constants.js";

// Imágenes locales (src/assets). Cada una se asigna a una sola sección (no se repiten).
// Las secciones sin imagen local siguen usando picsum.photos como respaldo.
import imglogin from "../assets/login.jpg";
import imghero from "../assets/herobanner.jpg";
import imgmision from "../assets/mision.jpg";
import imgagendar from "../assets/agendar.jpg";
import imgdashboard from "../assets/dashboard.jpg";
import imgsala from "../assets/sala.jpg";
import imgagenda from "../assets/agenda.jpg";
import imgcatalogo from "../assets/catalogo.jpg";
import imagreportes from "../assets/reportes.jpg";
import imgauditoria from "../assets/auditoria.jpg";
import imgatencion from "../assets/atencion.jpg";
import imgMedicina from "../assets/medicina_general.jpg";
import imgPediatria from "../assets/pediatria.jpg";
import imgEnfermeria from "../assets/enfermeria.jpg";
import imgKinesiologia from "../assets/kinesiologia.jpg";
import imgLaboratorio from "../assets/laboratorio.jpg";
import imgOdontologia from "../assets/odontologia.jpg";

// ═══════════════════════════════════════════════════════════
// 1. CONTENIDO ESTÁTICO DE LA UI
// ═══════════════════════════════════════════════════════════

export const SERVICIOS = [
  {
    icono: "bi-heart-pulse-fill",
    nombre: "Medicina general",
    desc: "Consultas de salud integral y control clínico para toda la familia.",
  },
  {
    icono: "bi-balloon-heart-fill",
    nombre: "Pediatría",
    desc: "Control del niño sano, vacunas y atención pediátrica especializada.",
  },
  {
    icono: "bi-clipboard2-pulse-fill",
    nombre: "Enfermería",
    desc: "Curaciones, toma de muestras y controles preventivos de enfermería.",
  },
  {
    icono: "bi-person-walking",
    nombre: "Kinesiología",
    desc: "Rehabilitación y terapia personalizada con kinesiólogos dedicados.",
  },
  {
    icono: "bi-eyedropper",
    nombre: "Laboratorio clínico",
    desc: "Exámenes de sangre y estudios de laboratorio con resultados rápidos.",
  },
  {
    icono: "bi-mask",
    nombre: "Odontología",
    desc: "Atención dental preventiva y de urgencia dentro de tu misma red.",
  },
];

export const BENEFICIOS = [
  {
    icono: "bi-stopwatch-fill",
    titulo: "Sin esperas en la sala",
    desc: "Seguimiento del estado de llegada y de la atención en tiempo real.",
  },
  {
    icono: "bi-alarm-fill",
    titulo: "Agenda en línea 24/7",
    desc: "Reserva, reprograma o cancela desde cualquier dispositivo, sin llamadas.",
  },
  {
    icono: "bi-house-heart-fill",
    titulo: "Cerca de tu hogar",
    desc: "Red de 20 centros de atención primaria distribuidos a lo largo del país.",
  },
  {
    icono: "bi-card-checklist",
    titulo: "Costos transparentes",
    desc: "Precio informado antes de confirmar tu hora, sin letra chica.",
  },
  {
    icono: "bi-shield-check",
    titulo: "FONASA e ISAPRE",
    desc: "Trabajamos con los principales sistemas de previsión de salud.",
  },
  {
    icono: "bi-journal-medical",
    titulo: "Salud integrada",
    desc: "Atención médica y odontológica en un solo lugar, con ficha digital.",
  },
];

export const TESTIMONIOS = [
  {
    nombre: "María Fernanda S.",
    rol: "Paciente · Control de salud",
    cita: "Agendé en dos minutos desde el celular y me llegó la confirmación al correo. Al llegar, sin fila y sin esperas.",
  },
  {
    nombre: "Jorge P.",
    rol: "Paciente · Odontología",
    cita: "Pude reprogramar mi hora sola desde la web y el centro me confirmó al instante. La ficha digital es muy cómoda.",
  },
  {
    nombre: "Carla R.",
    rol: "Madre · Pediatría",
    cita: "Los recordatorios automáticos me salvan cada semana con el control de mi hijo. Todo más ordenado y cercano.",
  },
];

export const FAQ = [
  {
    pregunta: "¿Necesito crear una cuenta para agendar?",
    respuesta: "Sí. Con la cuenta de paciente puedes reservar, reprogramar y cancelar tus horas en línea, además de recibir recordatorios automáticos por email y push.",
  },
  {
    pregunta: "¿Qué medios de pago se aceptan?",
    respuesta: "Aceptamos FONASA, ISAPRE y pago particular. El valor de tu prestación se informa antes de confirmar la hora, con total transparencia.",
  },
  {
    pregunta: "¿Puedo reprogramar o cancelar una atención?",
    respuesta: "Sí, desde la sección Mis atenciones. Puedes mover tu hora o cancelarla en línea sin llamar al centro.",
  },
  {
    pregunta: "¿VidaSalud reemplaza el servicio de urgencia?",
    respuesta: "No. VidaSalud agenda atenciones programadas de atención primaria y odontología. Ante urgencias de riesgo vital debes acudir a un servicio de urgencia.",
  },
];

export const CATEGORIAS = ["medicina", "pediatría", "enfermería", "dental", "laboratorio", "otros"];

export const TABS = [
  { id: "prestaciones", label: "Prestaciones", icon: "bi-clipboard2-pulse-fill" },
  { id: "boxes", label: "Boxes", icon: "bi-door-closed-fill" },
  { id: "cupos", label: "Cupos", icon: "bi-calendar-range-fill" },
];

export const ESTILO_TIPO = {
  LOGIN: { icono: "bi-box-arrow-in-right", bg: "rgba(46,134,193,0.14)", color: "#2E86C1" },
  LOGOUT: { icono: "bi-box-arrow-right", bg: "rgba(108,117,125,0.14)", color: "#6c757d" },
  SOLICITUD: { icono: "bi-file-earmark-plus", bg: "rgba(14,124,134,0.14)", color: "#0E7C86" },
  CREACION: { icono: "bi-pencil-square", bg: "rgba(14,124,134,0.14)", color: "#0E7C86" },
  CONFIRMACION: { icono: "bi-check2-circle", bg: "rgba(10,126,76,0.14)", color: "#0A7E4C" },
  LLEGADA: { icono: "bi-person-check", bg: "rgba(232,163,61,0.15)", color: "#B3801E" },
  INICIO_ATENCION: { icono: "bi-play-circle", bg: "rgba(155,89,182,0.14)", color: "#9B59B6" },
  CERRADA: { icono: "bi-clipboard-check", bg: "rgba(10,126,76,0.14)", color: "#0A7E4C" },
  CANCELACION: { icono: "bi-x-circle", bg: "rgba(221,68,68,0.14)", color: "#DD4444" },
  EDICION: { icono: "bi-pencil", bg: "rgba(108,117,125,0.14)", color: "#6c757d" },
};

// Configuración compartida de tooltips de recharts.
export const rechartsTooltip = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
};

// Fecha de hoy en formato ISO (yyyy-mm-dd), usada como fecha mínima/predeterminada.
export { hoyISO } from "../constants.js";

// Imágenes de cabecera de cada página (imagen de fondo de sección).
export const BANNERS = {
  login: { seed: "vidasalud-login", alt: "Centro de atención primaria de VidaSalud" },
  dashboard: { seed: "vidasalud-dashboard", alt: "Centro de operaciones de VidaSalud" },
  sala: { seed: "vidasalud-sala", alt: "Sala de espera de un centro VidaSalud" },
  agenda: { seed: "vidasalud-agenda", alt: "Agenda de atenciones de un paciente" },
  catalogo: { seed: "vidasalud-catalogo", alt: "Equipamiento y sala clínica de VidaSalud" },
  reportes: { seed: "vidasalud-reportes", alt: "Métricas e indicadores de operación" },
  auditoria: { seed: "vidasalud-auditoria", alt: "Registro y trazabilidad de eventos de seguridad" },
  atenciones: { seed: "vidasalud-atenciones", alt: "Atención de un paciente en un consultorio" },
};

// Fondos del landing (hero, misión y CTA), centralizados para mantener un solo origen de seeds.
export const FONDOS_LANDING = {
  hero: { seed: "vidasalud-hero", ancho: 1600, alto: 900 },
  mision: { seed: "vidasalud-mision", ancho: 900, alto: 900 },
  cta: { seed: "vidasalud-cta", ancho: 1200, alto: 600 },
};

// Genera la url de fondo a partir de su seed (tamaño opcional).
// Usa la imagen local de src/assets cuando existe para ese seed; si no, picsum.photos.
export const IMAGENES_LOCALES = {
  "vidasalud-login": imglogin,
  "vidasalud-hero": imghero,
  "vidasalud-mision": imgmision,
  "vidasalud-cta": imgagendar,
  "vidasalud-dashboard": imgdashboard,
  "vidasalud-sala": imgsala,
  "vidasalud-agenda": imgagenda,
  "vidasalud-catalogo": imgcatalogo,
  "vidasalud-reportes": imagreportes,
  "vidasalud-auditoria": imgauditoria,
  "vidasalud-atenciones": imgatencion,
};

// Foto de cada tarjeta de servicio, en el mismo orden que SERVICIOS.
export const IMAGENES_SERVICIOS = [imgMedicina, imgPediatria, imgEnfermeria, imgKinesiologia, imgLaboratorio, imgOdontologia];

// Imagen local de un servicio (por índice), o null si no existe.
export const imagenServicio = (i) => IMAGENES_SERVICIOS[i] || null;

export const fondoBanner = (seed, ancho = 1200, alto = 450) => {
  const local = IMAGENES_LOCALES[seed];
  return local ? `url("${local}")` : `url("https://picsum.photos/seed/${seed}/${ancho}/${alto}")`;
};

// Fondo de una sección del landing a partir de su clave en FONDOS_LANDING.
export const fondoLanding = (clave) => {
  const f = FONDOS_LANDING[clave];
  return fondoBanner(f.seed, f.ancho, f.alto);
};

// ═══════════════════════════════════════════════════════════
// 2. DATOS SIMULADOS (demo, VITE_USE_MOCKS=true)
// Son datos en memoria: crear atenciones, cambiar estados o generar
// cupos modifica estos arreglos durante la sesión del navegador.
// ═══════════════════════════════════════════════════════════

const hoy = sumarDias(0);

export const usuariosDemo = [
  { email: "admin@vidasalud.cl", password: "admin123", id: "u-admin", nombre: "Valeria Soto", rol: "admin", centroId: 1, cargo: "Administradora de la red" },
  { email: "recepcion@vidasalud.cl", password: "recepcion123", id: "u-recep", nombre: "Cristóbal Paredes", rol: "recepcionista", centroId: 1, cargo: "Operador del dominio — CESFAM Juan Pablo II" },
  { email: "paciente@vidasalud.cl", password: "paciente123", id: "u-pac", nombre: "María José Rivas", rol: "paciente", centroId: 1, cargo: "" },
  { email: "auditor@vidasalud.cl", password: "auditor123", id: "u-aud", nombre: "Ignacio Fuentes", rol: "auditor", centroId: null, cargo: "Auditor clínico-administrativo" },
];

const usuarioPorId = (id) => usuariosDemo.find((u) => u.id === id);

export const centros = [
  { id: 1, nombre: "CESFAM Juan Pablo II", tipo: "cesfam", direccion: "Av. Las Torres 1200, Puente Alto", ciudad: "Santiago", telefono: "+56 2 2123 4500" },
  { id: 2, nombre: "CESFAM Pedro Aguirre Cerda", tipo: "cesfam", direccion: "Vicuña Mackenna 3800, La Florida", ciudad: "Santiago", telefono: "+56 2 2345 6710" },
  { id: 3, nombre: "SAPU Los Aromos", tipo: "sapu", direccion: "Los Aromos 850, Maipú", ciudad: "Santiago", telefono: "+56 2 2567 8899" },
  { id: 4, nombre: "Clínica Dental Sonrisa", tipo: "dental", direccion: "Av. Providencia 2350, Providencia", ciudad: "Santiago", telefono: "+56 2 2789 1122" },
  { id: 5, nombre: "Clínica Dental Belén", tipo: "dental", direccion: "Merced 636, Valparaíso", ciudad: "Valparaíso", telefono: "+56 32 2450 3344" },
  { id: 6, nombre: "CESFAM Marta Colvin", tipo: "cesfam", direccion: "Gran Avenida 5610, San Miguel", ciudad: "Santiago", telefono: "+56 2 2890 5566" },
];

export const prestaciones = [
  { id: 1, nombre: "Consulta médica general", categoria: "medicina", duracionMin: 20, requiereBox: true, activa: true },
  { id: 2, nombre: "Control crónico (hipertensión/diabetes)", categoria: "medicina", duracionMin: 25, requiereBox: true, activa: true },
  { id: 3, nombre: "Control niño sano", categoria: "pediatría", duracionMin: 30, requiereBox: true, activa: true },
  { id: 4, nombre: "Curaciones", categoria: "enfermería", duracionMin: 20, requiereBox: true, activa: true },
  { id: 5, nombre: "Vacunación / inyectable", categoria: "enfermería", duracionMin: 15, requiereBox: true, activa: true },
  { id: 6, nombre: "Toma de muestra de laboratorio", categoria: "laboratorio", duracionMin: 15, requiereBox: false, activa: true },
  { id: 7, nombre: "Atención odontológica básica", categoria: "dental", duracionMin: 30, requiereBox: true, activa: true },
  { id: 8, nombre: "Limpieza dental", categoria: "dental", duracionMin: 40, requiereBox: true, activa: true },
  { id: 9, nombre: "Endodoncia", categoria: "dental", duracionMin: 60, requiereBox: true, activa: true },
  { id: 10, nombre: "Retiro de puntos", categoria: "medicina", duracionMin: 15, requiereBox: true, activa: true },
];

export const boxes = (() => {
  const lista = [];
  centros.forEach((c) => {
    const cant = c.tipo === "dental" ? 4 : 5;
    for (let i = 1; i <= cant; i++) {
      const prefijo = c.tipo === "dental" ? "Box Dental" : "Box";
      lista.push({
        id: `${c.id}-${i}`,
        centroId: c.id,
        nombre: `${prefijo} ${i}`,
        tipo: c.tipo === "dental" ? "dental" : "atención",
        activo: true,
      });
    }
  });
  return lista;
})();

const HORA_INICIO = 8;
const HORA_FIN = 17;

const generarSlots = (prestacion, fecha, centroId) => {
  const slots = [];
  const duracion = prestacion.duracionMin;
  const horaIndex = (h, m) => h * 60 + m;
  let cursor = horaIndex(HORA_INICIO, 0);
  const limite = horaIndex(HORA_FIN, 0) - duracion;
  while (cursor <= limite) {
    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    slots.push({
      hora: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      fecha,
      centroId,
      prestacionId: prestacion.id,
      duracionMin: duracion,
    });
    cursor += duracion;
  }
  return slots;
};

let citaSeq = 100;

const crearCita = (paciente, prestacion, centro, opt = {}) => {
  const estado = opt.estado || "Solicitada";
  const fecha = opt.fecha || hoy;
  const box = opt.box || (prestacion.requiereBox ? boxes.find((b) => b.centroId === centro.id && b.tipo === (prestacion.categoria === "dental" ? "dental" : "atención")) : null);
  const cita = {
    id: citaSeq++,
    codigo: `VSA-${String(citaSeq).padStart(4, "0")}`,
    pacienteId: paciente.id,
    pacienteNombre: paciente.nombre,
    pacienteEmail: paciente.email,
    prestacionId: prestacion.id,
    prestacion: prestacion.nombre,
    categoria: prestacion.categoria,
    duracionMin: prestacion.duracionMin,
    centroId: centro.id,
    centroNombre: centro.nombre,
    boxId: box?.id || null,
    boxNombre: box?.nombre || "Sala de procedimientos",
    fecha,
    hora: opt.hora || "09:00",
    estado,
    operadorId: opt.operadorId || null,
    operadorNombre: opt.operadorId ? (usuarioPorId(opt.operadorId)?.nombre || "") : "",
    prestadorNombre: opt.prestadorNombre || (prestacion.categoria === "dental" ? "Dr. Morales" : "Dra. Gutiérrez"),
    solicitadoPor: opt.solicitadoPor || "paciente",
    observaciones: opt.observaciones || "",
    creadoEn: opt.creadoEn || `${fecha} 08:30`,
    llegadaHora: opt.llegadaHora || null,
    inicioHora: opt.inicioHora || null,
    finHora: opt.finHora || null,
    notificaciones: opt.notificaciones || [],
  };
  return cita;
};

export const citas = [
  crearCita({ nombre: "María José Rivas", email: "paciente@vidasalud.cl", id: "u-pac" }, prestaciones[0], centros[0], {
    fecha: hoy, hora: "09:00", estado: "Confirmada", operadorId: "u-recep", llegadaHora: null,
    notificaciones: [{ tipo: "email", horaEnviada: "08:00", asunto: "Recordatorio cita" }],
  }),
  crearCita({ nombre: "Pedro Salas", email: "pedro@mail.cl", id: "p2" }, prestaciones[1], centros[0], {
    fecha: hoy, hora: "09:20", estado: "En espera", operadorId: "u-recep", llegadaHora: "08:50",
  }),
  crearCita({ nombre: "Ana Contreras", email: "ana@mail.cl", id: "p3" }, prestaciones[3], centros[0], {
    fecha: hoy, hora: "10:00", estado: "En atención", operadorId: "u-recep", llegadaHora: "09:35", inicioHora: "10:02",
  }),
  crearCita({ nombre: "Luis Bravo", email: "luis@mail.cl", id: "p4" }, prestaciones[4], centros[0], {
    fecha: hoy, hora: "10:20", estado: "Confirmada", operadorId: "u-recep",
  }),
  crearCita({ nombre: "Carmen Díaz", email: "carmen@mail.cl", id: "p5" }, prestaciones[2], centros[0], {
    fecha: hoy, hora: "11:00", estado: "Solicitada",
  }),
  crearCita({ nombre: "María José Rivas", email: "paciente@vidasalud.cl", id: "u-pac" }, prestaciones[7], centros[3], {
    fecha: sumarDias(1), hora: "15:30", estado: "Confirmada", operadorId: "u-recep",
    notificaciones: [{ tipo: "push", horaEnviada: `${hoy} 18:00`, asunto: "Confirmación de cita" }],
  }),
  crearCita({ nombre: "Rodrigo Núñez", email: "rodrigo@mail.cl", id: "p7" }, prestaciones[8], centros[3], {
    fecha: hoy, hora: "11:30", estado: "En espera", llegadaHora: "11:10",
  }),
  crearCita({ nombre: "Isabel Flores", email: "isabel@mail.cl", id: "p8" }, prestaciones[6], centros[3], {
    fecha: hoy, hora: "12:10", estado: "Cerrada", llegadaHora: "11:40", inicioHora: "12:15", finHora: "12:50",
  }),
  crearCita({ nombre: "Jorge Muñoz", email: "jorge@mail.cl", id: "p9" }, prestaciones[0], centros[4], {
    fecha: sumarDias(-1), hora: "10:00", estado: "Cerrada", llegadaHora: "09:40", inicioHora: "10:05", finHora: "10:30", operadorId: "u-recep",
  }),
  crearCita({ nombre: "Sofía Rojas", email: "sofia@mail.cl", id: "p10" }, prestaciones[8], centros[3], {
    fecha: hoy, hora: "16:00", estado: "Confirmada",
  }),
  crearCita({ nombre: "Daniela Varas", email: "daniela@mail.cl", id: "p11" }, prestaciones[4], centros[0], {
    fecha: hoy, hora: "09:00", estado: "Cerrada", llegadaHora: "08:50", inicioHora: "09:05", finHora: "09:20", operadorId: "u-recep",
  }),
  crearCita({ nombre: "Tomás Herrera", email: "tomas@mail.cl", id: "p12" }, prestaciones[1], centros[2], {
    fecha: hoy, hora: "15:00", estado: "Cancelada",
  }),
  crearCita({ nombre: "María José Rivas", email: "paciente@vidasalud.cl", id: "u-pac" }, prestaciones[0], centros[0], {
    fecha: sumarDias(-3), hora: "09:00", estado: "Cerrada", llegadaHora: "08:55", inicioHora: "09:02", finHora: "09:25",
  }),
  crearCita({ nombre: "Paola Vega", email: "paola@mail.cl", id: "p13" }, prestaciones[3], centros[0], {
    fecha: hoy, hora: "12:00", estado: "Cerrada", llegadaHora: "11:45", inicioHora: "12:02", finHora: "12:25",
  }),
  crearCita({ nombre: "Marcelo Vidal", email: "marcelo@mail.cl", id: "p14" }, prestaciones[5], centros[2], {
    fecha: hoy, hora: "09:40", estado: "En atención", llegadaHora: "09:20", inicioHora: "09:45",
  }),
];

export const auditEventos = [
  { id: 1, fecha: sumarDias(-3), hora: "08:12", usuario: "María José Rivas", rol: "paciente", tipo: "SOLICITUD", descripcion: "Solicitó atención de Consulta médica general", entidad: "Atención", entidadId: "VSA-0104" },
  { id: 2, fecha: sumarDias(-2), hora: "10:05", usuario: "Cristóbal Paredes", rol: "recepcionista", tipo: "CONFIRMACION", descripcion: "Confirmó la atención VSA-0104", entidad: "Atención", entidadId: "VSA-0104" },
  { id: 3, fecha: sumarDias(-1), hora: "09:00", usuario: "Isabel Flores", rol: "paciente", tipo: "SOLICITUD", descripcion: "Solicitó atención de Atención odontológica básica", entidad: "Atención", entidadId: "VSA-0109" },
  { id: 4, fecha: sumarDias(-1), hora: "09:10", usuario: "María José Rivas", rol: "paciente", tipo: "LOGIN", descripcion: "Inicio de sesión (Azure AD)", entidad: "Sesión", entidadId: "—" },
  { id: 5, fecha: hoy, hora: "08:50", usuario: "Cristóbal Paredes", rol: "recepcionista", tipo: "LLEGADA", descripcion: "Registró llegada del paciente Pedro Salas", entidad: "Atención", entidadId: "VSA-0102" },
  { id: 6, fecha: hoy, hora: "10:02", usuario: "Cristóbal Paredes", rol: "recepcionista", tipo: "INICIO_ATENCION", descripcion: "Marcó inicio de atención de Ana Contreras", entidad: "Atención", entidadId: "VSA-0103" },
  { id: 7, fecha: hoy, hora: "11:00", usuario: "Carmen Díaz", rol: "paciente", tipo: "SOLICITUD", descripcion: "Solicitó atención de Control niño sano", entidad: "Atención", entidadId: "VSA-0106" },
  { id: 8, fecha: hoy, hora: "12:15", usuario: "Cristóbal Paredes", rol: "recepcionista", tipo: "CERRADA", descripcion: "Marcó como cerrada la atención VSA-0109", entidad: "Atención", entidadId: "VSA-0109" },
];

const registrarAudit = (tipo, usuario, entidad, entidadId, descripcion) => {
  auditEventos.unshift({
    id: auditEventos.length + 1000,
    fecha: hoy,
    hora: horaActual(),
    usuario: usuario?.nombre || "Sistema",
    rol: usuario?.rol || "sistema",
    tipo,
    descripcion,
    entidad,
    entidadId,
  });
};

const esperar = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// ── Auth ─────────────────────────────────────────────────
// Usuarios creados por la pantalla de registro (en memoria, solo demo).
export const usuariosRegistrados = [];

export async function mockLogin(email, password) {
  await esperar();
  const u = [...usuariosDemo, ...usuariosRegistrados].find((x) => x.email === email.toLowerCase() && x.password === password);
  if (!u) throw new Error("Credenciales incorrectas");
  registrarAudit("LOGIN", u, "Sesión", "—", `Inicio de sesión (${password === "azure" ? "Azure AD" : "tradicional"})`);
  return { token: `demo-token-${u.id}`, user: perfilPublico(u) };
}

export async function mockRegister({ nombre, email, password }) {
  await esperar();
  const emailLower = email.toLowerCase();
  const ocupado = [...usuariosDemo, ...usuariosRegistrados].some((u) => u.email === emailLower);
  if (ocupado) throw new Error("Ya existe una cuenta con ese correo.");
  const nuevo = { id: `u-pac-${Date.now()}`, email: emailLower, password, nombre, rol: "paciente", centroId: null, cargo: "" };
  usuariosRegistrados.push(nuevo);
  registrarAudit("CREACION", nuevo, "Usuario", emailLower, `El paciente "${nombre}" creó su cuenta de acceso (sin Azure AD)`);
  return { token: `demo-token-${nuevo.id}`, user: perfilPublico(nuevo) };
}

export function perfilPublico(u) {
  return { id: u.id, email: u.email, nombre: u.nombre, rol: u.rol, centroId: u.centroId, cargo: u.cargo || "" };
}

// ── Dashboard ────────────────────────────────────────────
export async function mockDashboardKpis() {
  await esperar(300);
  const deHoy = citas.filter((c) => c.fecha === hoy);
  const porHora = {};
  deHoy.forEach((c) => {
    const h = c.hora.split(":")[0] + ":00";
    porHora[h] = (porHora[h] || 0) + 1;
  });
  const atencionesPorHora = Object.entries(porHora).map(([hora, atenciones]) => ({ hora, atenciones }));
  const porEstado = {};
  deHoy.forEach((c) => { porEstado[c.estado] = (porEstado[c.estado] || 0) + 1; });
  const estados = Object.entries(porEstado).map(([name, value]) => ({ name, value }));

  const porCentro = {};
  deHoy.forEach((c) => { porCentro[c.centroNombre] = (porCentro[c.centroNombre] || 0) + 1; });
  const atencionesPorCentro = Object.entries(porCentro).map(([name, atenciones]) => ({ name, atenciones }));

  return {
    atencionesHoy: deHoy.length,
    cerradasHoy: deHoy.filter((c) => c.estado === "Cerrada").length,
    enEspera: deHoy.filter((c) => ["Confirmada", "En espera", "En atención"].includes(c.estado)).length,
    atencionesPorHora,
    estados,
    atencionesPorCentro,
    centrosActivos: centros.length,
  };
}

export async function mockSalaEspera() {
  await esperar(300);
  const activas = citas
    .filter((c) => c.fecha === hoy && ["Confirmada", "En espera", "En atención"].includes(c.estado))
    .map((c) => {
      let espera = 0;
      if (c.llegadaHora) {
        const [lh, lm] = c.llegadaHora.split(":").map(Number);
        const now = new Date();
        espera = Math.max(0, Math.round((now.getHours() * 60 + now.getMinutes() - (lh * 60 + lm)) / 1));
      }
      return { ...c, tiempoEsperaMin: espera };
    })
    .sort((a, b) => (a.estado === "En espera" ? -1 : 1) - (b.estado === "En espera" ? -1 : 1) || a.hora.localeCompare(b.hora));
  return activas;
}

export async function mockProximasAtenciones(pacienteId) {
  await esperar(300);
  return citas
    .filter((c) => c.pacienteId === pacienteId && !["Cancelada"].includes(c.estado))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
}

// ── Atenciones ───────────────────────────────────────────
export async function mockListAppointments(filtros = {}) {
  await esperar(300);
  let lista = [...citas];
  if (filtros.estado && filtros.estado !== "Todas") lista = lista.filter((c) => c.estado === filtros.estado);
  if (filtros.centroId) lista = lista.filter((c) => String(c.centroId) === String(filtros.centroId));
  if (filtros.pacienteId) lista = lista.filter((c) => c.pacienteId === filtros.pacienteId);
  if (filtros.fecha) lista = lista.filter((c) => c.fecha === filtros.fecha);
  if (filtros.desde) lista = lista.filter((c) => c.fecha >= filtros.desde);
  if (filtros.hasta) lista = lista.filter((c) => c.fecha <= filtros.hasta);
  return lista.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
}

export async function mockCreateAppointment(data, actor) {
  await esperar(400);
  const prestacion = prestaciones.find((p) => p.id === Number(data.prestacionId));
  const centro = centros.find((c) => c.id === Number(data.centroId));
  const paciente = { nombre: data.pacienteNombre, email: data.pacienteEmail, id: data.pacienteId || `p-${Date.now()}` };
  const cita = crearCita(paciente, prestacion, centro, {
    fecha: data.fecha,
    hora: data.hora,
    observaciones: data.observaciones || "",
    solicitadoPor: actor?.rol === "paciente" ? "paciente" : "recepcion",
    operadorId: actor?.rol === "recepcionista" ? actor.id : null,
    estado: actor?.rol === "paciente" ? "Solicitada" : "Confirmada",
  });
  citas.push(cita);
  registrarAudit(
    actor?.rol === "paciente" ? "SOLICITUD" : "CREACION",
    actor,
    "Atención",
    cita.codigo,
    `${actor?.rol === "paciente" ? "Solicitó" : "Registró"} atención de ${prestacion.nombre}`,
  );
  return cita;
}

export async function mockChangeEstado(id, estado, actor) {
  await esperar(300);
  const cita = citas.find((c) => c.id === Number(id) || c.id === id);
  if (!cita) throw new Error("Atención no encontrada");
  cita.estado = estado;
  if (estado === "En espera" && !cita.llegadaHora) cita.llegadaHora = horaActual();
  if (estado === "En atención" && !cita.inicioHora) cita.inicioHora = horaActual();
  if (estado === "Cerrada" && !cita.finHora) cita.finHora = horaActual();
  const tipos = { Confirmada: "CONFIRMACION", "En espera": "LLEGADA", "En atención": "INICIO_ATENCION", Cerrada: "CERRADA", Cancelada: "CANCELACION" };
  registrarAudit(tipos[estado] || "EDICION", actor, "Atención", cita.codigo, `Cambió estado a "${estado}"`);
  return cita;
}

// ── Catálogo ─────────────────────────────────────────────
export async function mockListPrestaciones() {
  await esperar(250);
  return [...prestaciones];
}

export async function mockCreatePrestacion(data, actor) {
  await esperar(250);
  const p = { id: prestaciones.length + 1, ...data, activa: true };
  prestaciones.push(p);
  registrarAudit("CREACION", actor, "Prestación", p.nombre, `Creó prestación "${p.nombre}"`);
  return p;
}

export async function mockUpdatePrestacion(id, data) {
  await esperar(250);
  const idx = prestaciones.findIndex((p) => p.id === Number(id));
  if (idx >= 0) prestaciones[idx] = { ...prestaciones[idx], ...data };
  return prestaciones[idx];
}

export async function mockListBoxes() {
  await esperar(250);
  return [...boxes];
}

export async function mockCreateBox(data, actor) {
  await esperar(250);
  const b = { id: `${data.centroId}-${boxes.length + 1}`, ...data, activo: true };
  boxes.push(b);
  registrarAudit("CREACION", actor, "Box", b.nombre, `Creó ${b.nombre}`);
  return b;
}

export async function mockUpdateBox(id, data) {
  await esperar(250);
  const idx = boxes.findIndex((b) => b.id === id);
  if (idx >= 0) boxes[idx] = { ...boxes[idx], ...data };
  return boxes[idx];
}

export async function mockListCupos({ fecha, centroId, prestacionId }) {
  await esperar(300);
  const prestacion = prestaciones.find((p) => p.id === Number(prestacionId));
  if (!prestacion) return [];
  const slots = generarSlots(prestacion, fecha, centroId);
  const ocupados = citas.filter((c) => c.fecha === fecha && c.centroId === Number(centroId));
  // El cupo se reserva solo cuando la atención ya está confirmada (o más avanzada);
  // una solicitud pendiente o una cancelada no ocupan cupo.
  const estadosConCupo = ["Confirmada", "En espera", "En atención", "Cerrada"];
  return slots.map((s) => {
    const ocupado = ocupados.some((c) => c.hora === s.hora && estadosConCupo.includes(c.estado));
    return { ...s, estado: ocupado ? "ocupado" : "disponible" };
  });
}

export async function mockGenerarCupos({ fecha, prestacionId, boxId }) {
  await esperar(400);
  const prestacion = prestaciones.find((p) => p.id === Number(prestacionId));
  const box = boxes.find((b) => b.id === boxId);
  registrarAudit("CREACION", null, "Cupos", `${box?.nombre || boxId} ${fecha}`, `Generó cupos para ${prestacion?.nombre}`);
  return generarSlots(prestacion, fecha, boxId).map((s) => ({ ...s, estado: "disponible" }));
}

// ── Reportes ─────────────────────────────────────────────
export async function mockReportsPorHora({ desde, hasta } = {}) {
  await esperar(350);
  const list = citas.filter((c) =>
    (!desde || c.fecha >= desde) && (!hasta || c.fecha <= hasta) && c.estado !== "Cancelada"
  );
  const agg = {};
  list.forEach((c) => {
    const key = `${c.fecha} ${c.hora.split(":")[0]}h`;
    agg[key] = (agg[key] || 0) + 1;
  });
  return Object.entries(agg).map(([name, atenciones]) => ({ name, atenciones }));
}

export async function mockReportesTiempos({ desde, hasta } = {}) {
  await esperar(350);
  const list = citas.filter((c) =>
    (!desde || c.fecha >= desde) && (!hasta || c.fecha <= hasta) && c.llegadaHora && c.inicioHora
  );
  const agg = {};
  list.forEach((c) => {
    const [lh, lm] = c.llegadaHora.split(":").map(Number);
    const [ih, im] = c.inicioHora.split(":").map(Number);
    const espera = ih * 60 + im - (lh * 60 + lm);
    if (!agg[c.fecha]) agg[c.fecha] = [];
    agg[c.fecha].push(espera);
  });
  return Object.entries(agg).map(([fecha, arr]) => ({
    fecha,
    promedioMin: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
  }));
}

export async function mockPrestacionesDemandadas({ desde, hasta } = {}) {
  await esperar(350);
  const list = citas.filter((c) =>
    (!desde || c.fecha >= desde) && (!hasta || c.fecha <= hasta) && c.estado !== "Cancelada"
  );
  const agg = {};
  list.forEach((c) => { agg[c.prestacion] = (agg[c.prestacion] || 0) + 1; });
  return Object.entries(agg).map(([name, cantidad]) => ({ name, cantidad })).sort((a, b) => b.cantidad - a.cantidad);
}

// ── Auditoría ────────────────────────────────────────────
export async function mockListAudit({ usuario, desde, hasta, tipo } = {}) {
  await esperar(300);
  let list = [...auditEventos];
  if (usuario) list = list.filter((e) => e.usuario.toLowerCase().includes(usuario.toLowerCase()));
  if (tipo && tipo !== "Todos") list = list.filter((e) => e.tipo === tipo);
  if (desde) list = list.filter((e) => e.fecha >= desde);
  if (hasta) list = list.filter((e) => e.fecha <= hasta);
  return list.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(b.hora));
}