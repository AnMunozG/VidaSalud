import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../componentes/AuthContext";
import { Cargando, EstadoVacio, EstadoContenido } from "../componentes/Estado";
import BadgeEstado from "../componentes/BadgeEstado";
import FechaHoy from "../componentes/FechaHoy";
import BannerPagina from "../componentes/BannerPagina";
import BoTable from "../componentes/BoTable";
import { dashboardService, atencionesService, CHART_COLORS, ESTADOS_ATENCION, formatearFechaHora } from "../api.js";
import { rechartsTooltip, BANNERS } from "../componentes/Datos.js";

export default function Dashboard() {
  const { user } = useAuth();
  if (user.rol === "admin") return <DashboardAdmin />;
  if (user.rol === "recepcionista") return <DashboardRecepcionista />;
  return <DashboardPaciente />;
}

// ── ADMIN: KPIs y panel de operaciones ─────────────────────
function DashboardAdmin() {
  const [kpis, setKpis] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService
      .kpis()
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Cargando texto="Cargando panel de operaciones…" />;
  if (!kpis) return (
    <div className="app-page app-page-narrow">
      <div className="app-header"><h2>Dashboard</h2><FechaHoy /></div>
      <EstadoVacio icon="bi-plug" mensaje="No se pudo obtener los datos del panel.">
        <Link to="/appointments" className="btn btn-outline-primary btn-sm mt-2">Ir a Atenciones</Link>
      </EstadoVacio>
    </div>
  );

  const cards = [
    { icon: "bi-calendar2-check-fill", label: "Atenciones hoy", value: kpis.atencionesHoy, color: "#0E7C86", bg: "rgba(14,124,134,0.12)" },
    { icon: "bi-people-fill", label: "En sala / pendientes", value: kpis.enEspera, color: "#E8A33D", bg: "rgba(232,163,61,0.14)" },
    { icon: "bi-check2-circle", label: "Cerradas hoy", value: kpis.cerradasHoy, color: "#0A7E4C", bg: "rgba(10,126,76,0.12)" },
    { icon: "bi-building-fill", label: "Centros activos", value: kpis.centrosActivos, color: "#9B59B6", bg: "rgba(155,89,182,0.12)" },
  ];

  return (
    <div className="app-page">
      <BannerPagina banner={BANNERS.dashboard} />
      <div className="app-header">
        <h2><i className="bi bi-speedometer2 me-2 c-primary"></i>Dashboard de operaciones</h2>
        <FechaHoy />
      </div>

      <div className="row g-3 mb-4">
        {cards.map((c, i) => (
          <div key={i} className="col-sm-6 col-xl-auto" style={{ flex: "1 1 150px" }}>
            <div className="stat-card card-accent-left" style={{ "--accent-color": c.color }}>
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="stat-card-label">{c.label}</div>
                  <div className="stat-card-value">{c.value}</div>
                </div>
                <div className="stat-card-icon" style={{ background: c.bg, color: c.color }}>
                  <i className={`bi ${c.icon}`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="bo-chart-card">
            <h5 className="mb-3 c-heading"><i className="bi bi-bar-chart-fill me-2 c-primary"></i>Atenciones por hora (hoy)</h5>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kpis.atencionesPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hora" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip contentStyle={rechartsTooltip} />
                <Bar dataKey="atenciones" fill="#0E7C86" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="bo-chart-card h-100">
            <h5 className="mb-3 c-heading"><i className="bi bi-pie-chart-fill me-2 c-primary"></i>Estados activos</h5>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={kpis.estados} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={42}>
                  {kpis.estados.map((e, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={rechartsTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bo-chart-card">
        <h5 className="mb-3 c-heading"><i className="bi bi-geo-alt-fill me-2 c-primary"></i>Atenciones por centro (hoy)</h5>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={kpis.atencionesPorCentro} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={190} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <Tooltip contentStyle={rechartsTooltip} />
            <Bar dataKey="atenciones" fill="#4EC3C9" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── RECEPCIONISTA: sala de espera ─────────────────────
function DashboardRecepcionista() {
  const { user } = useAuth();
  const [sala, setSala] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState(null);

  const cargar = () => dashboardService.salaEspera().then(setSala).finally(() => setCargando(false));

  useEffect(() => {
    if (user.rol === "recepcionista") cargar();
  }, [user.rol]);

  const avanzar = async (cita, siguiente) => {
    setTrabajando(cita.id);
    try {
      await atencionesService.changeEstado(cita.id, siguiente, user);
      await cargar();
    } finally {
      setTrabajando(null);
    }
  };

  const badgeTiempo = (min) => {
    if (min === 0) return <span className="waiting-pill waiting-ok">Recién llegado</span>;
    if (min < 15) return <span className="waiting-pill waiting-ok">{min} min</span>;
    if (min < 30) return <span className="waiting-pill waiting-warn">{min} min</span>;
    return <span className="waiting-pill waiting-alert">{min} min</span>;
  };

  const siguienteAccion = (estado) => {
    if (estado === "Confirmada") return { estado: "En espera", label: "Registrar llegada", icon: "bi-box-arrow-in-down", cls: "btn-outline-success" };
    if (estado === "En espera") return { estado: "En atención", label: "Iniciar atención", icon: "bi-play-circle", cls: "btn-outline-warning" };
    if (estado === "En atención") return { estado: "Atendida", label: "Marcar atendida", icon: "bi-check-lg", cls: "btn-outline-primary" };
    return null;
  };

  return (
    <div className="app-page">
      <BannerPagina banner={BANNERS.sala} />
      <div className="app-header">
        <h2><i className="bi bi-person-walking me-2 c-primary"></i>Sala de espera</h2>
        <FechaHoy />
      </div>

      <EstadoContenido
        cargando={cargando}
        textoCargando="Cargando sala de espera…"
        vacio={sala.length === 0}
        icono="bi-emoji-smile"
        mensaje="No hay pacientes en sala de espera en este momento."
        accion={<Link to="/appointments" className="btn btn-outline-primary btn-sm mt-2">Ver todas las atenciones</Link>}
      >
        <>
          <div className="alert mock-alert small">
            <i className="bi bi-bell me-1"></i>
            <strong>{sala.length}</strong> atención(es) en flujo. Confirma la llegada de cada paciente al box y avanza su estado.
          </div>
          <BoTable columnas={["Código", "Paciente", "Prestación", "Box", "Hora", "Estado", "Tiempo de espera", { texto: "Acción", clase: "bo-actions-th" }]}>
            {sala.map((c) => {
              const accion = siguienteAccion(c.estado);
              return (
                <tr key={c.id}>
                  <td><span className="bo-id">{c.codigo}</span></td>
                  <td className="fw-medium">{c.pacienteNombre}</td>
                  <td>{c.prestacion}</td>
                  <td>{c.boxNombre}</td>
                  <td>{c.hora}</td>
                  <td><BadgeEstado estado={c.estado} /></td>
                  <td>{badgeTiempo(c.tiempoEsperaMin || 0)}</td>
                  <td>
                    {accion && (
                      <button
                        className={`btn btn-sm ${accion.cls}`}
                        disabled={trabajando === c.id}
                        onClick={() => avanzar(c, accion.estado)}
                      >
                        <i className={`bi ${accion.icon} me-1`}></i>
                        {trabajando === c.id ? "…" : accion.label}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </BoTable>
        </>
      </EstadoContenido>
    </div>
  );
}

// ── PACIENTE: próximas atenciones ─────────────────────
const ORDEN_CLASE = ESTADOS_ATENCION.reduce((acc, e, i) => ({ ...acc, [e]: i }), {});

function DashboardPaciente() {
  const { user } = useAuth();
  const [proximas, setProximas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService.proximasAtenciones(user.id).then(setProximas).finally(() => setCargando(false));
  }, [user.id]);

  const ordenadas = [...proximas].sort((a, b) => ORDEN_CLASE[a.estado] - ORDEN_CLASE[b.estado]);

  return (
    <div className="app-page">
      <BannerPagina banner={BANNERS.agenda} />
      <div className="app-header">
        <h2><i className="bi bi-calendar2-week me-2 c-primary"></i>Mis atenciones</h2>
        <FechaHoy />
      </div>

      <EstadoContenido
        cargando={cargando}
        textoCargando="Cargando tus atenciones…"
        vacio={ordenadas.length === 0}
        icono="bi-calendar-x"
        mensaje="No tienes atenciones próximas."
        accion={
          <Link to="/appointments" className="btn btn-primary btn-sm mt-2">
            <i className="bi bi-plus-lg me-1"></i>Agendar una atención
          </Link>
        }
      >
        <div className="row g-3">
          {ordenadas.map((c) => (
            <div className="col-md-6 col-xl-4" key={c.id}>
              <div className="bo-chart-card h-100 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold c-heading">{c.prestacion}</div>
                    <div className="small text-muted">{c.centroNombre}</div>
                  </div>
                  <BadgeEstado estado={c.estado} />
                </div>
                <div className="small">
                  <i className="bi bi-calendar3 me-1 c-muted"></i>{formatearFechaHora(c.fecha, c.hora)}
                  <div className="mt-1">
                    <i className="bi bi-box me-1 c-muted"></i>{c.boxNombre} · <i className="bi bi-clock me-1 c-muted"></i>{c.duracionMin} min
                  </div>
                </div>
                {c.estado === "Solicitada" && (
                  <div className="alert alert-light border small py-1 mb-0">
                    <i className="bi bi-hourglass-split me-1"></i>
                    Pendiente de confirmación por el centro. Recibirás una notificación por email/push.
                  </div>
                )}
                {c.estado === "Confirmada" && (
                  <div className="alert alert-info border small py-1 mb-0">
                    <i className="bi bi-check-lg me-1"></i>
                    Tu atención está confirmada. Preséntate 10 min antes en {c.boxNombre}.
                  </div>
                )}
                <Link to="/appointments" className="btn btn-sm btn-outline-primary mt-auto">
                  Ver detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </EstadoContenido>
      <div className="d-flex justify-content-end mt-4">
        <Link to="/appointments" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Agendar nueva atención
        </Link>
      </div>
    </div>
  );
}