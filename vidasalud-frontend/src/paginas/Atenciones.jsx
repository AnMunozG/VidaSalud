import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../componentes/AuthContext";
import { Cargando, EstadoContenido } from "../componentes/Estado";
import BadgeEstado from "../componentes/BadgeEstado";
import Modal from "../componentes/Modal";
import ModalFormulario from "../componentes/ModalFormulario";
import BannerPagina from "../componentes/BannerPagina";
import BoTable from "../componentes/BoTable";
import { atencionesService, catalogoService, ESTADOS_ATENCION, formatearFecha, formatearFechaHora } from "../api.js";
import { hoyISO } from "../constants.js";
import { BANNERS } from "../componentes/Datos.js";
import { encontrarPorId } from "../utilidades.js";

export default function Appointments() {
  const { user } = useAuth();
  const esPaciente = user.rol === "paciente";

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ estado: "Todas", centroId: "", fecha: "" });

  const [showCrear, setShowCrear] = useState(false);
  const [ticketCita, setTicketCita] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(null);
  const [cancelacionCita, setCancelacionCita] = useState(null);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const params = esPaciente ? { pacienteId: user.id } : { ...filtros };
      const data = await atencionesService.getAll(params);
      setCitas(Array.isArray(data) ? data : []);
    } finally {
      setCargando(false);
    }
  }, [esPaciente, user.id, filtros]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    cargar();
  }, [cargar]);

  const cambiarEstado = async (cita, estado) => {
    if (estado === "Cancelada") {
      setCancelacionCita(cita);
      return;
    }
    setCambiandoEstado(cita.id);
    try {
      await atencionesService.changeEstado(cita.id, estado, user);
      await cargar();
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setCambiandoEstado(null);
    }
  };

  const confirmarCancelacion = async () => {
    if (!cancelacionCita) return;
    setCambiandoEstado(cancelacionCita.id);
    try {
      await atencionesService.changeEstado(cancelacionCita.id, "Cancelada", user);
      await cargar();
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setCambiandoEstado(null);
      setCancelacionCita(null);
    }
  };

  return (
    <div className="app-page">
      <BannerPagina banner={BANNERS.atenciones} />
      <div className="app-header">
        <h2>
          <i className="bi bi-calendar2-check-fill me-2 c-primary"></i>
          {esPaciente ? "Mis atenciones" : "Atenciones"}
        </h2>
        <div className="d-flex gap-2 align-items-center">
          {!esPaciente && (
            <>
              <label className="form-label m-0 small c-muted">Estado:</label>
              <select
                className="form-select form-select-sm w-auto"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="Todas">Todas</option>
                {ESTADOS_ATENCION.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <label className="form-label m-0 small c-muted">Fecha:</label>
              <input
                type="date"
                className="form-control form-control-sm w-auto"
                value={filtros.fecha}
                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
              />
            </>
          )}
          <button className="btn btn-sm btn-success" onClick={() => setShowCrear(true)}>
            <i className="bi bi-plus-lg me-1"></i>Agendar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger small py-2 d-flex justify-content-between">
          <span><i className="bi bi-exclamation-circle-fill me-1"></i>{error}</span>
          <button className="btn-close btn-sm" onClick={() => setError("")} aria-label="Cerrar"></button>
        </div>
      )}

<EstadoContenido
        cargando={cargando}
        textoCargando="Cargando atenciones…"
        vacio={citas.length === 0}
        icono="bi-calendar-x"
        mensaje={esPaciente ? "No tienes atenciones registradas." : "No hay atenciones con los filtros seleccionados."}
        accion={
          <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => setShowCrear(true)}>
            <i className="bi bi-plus-lg me-1"></i>Agendar una atención
          </button>
        }
      >
        <BoTable columnas={["Cod.", "Paciente", "Prestación", "Centro", "Box", "Fecha · Hora", "Solicitó", "Estado", { texto: "Acciones", clase: "bo-actions-th" }]}>
          {citas.map((c) => {
              const esPersonal = user.rol !== "paciente";
              const disponibles = esPersonal
                ? ESTADOS_ATENCION.filter((s) => s !== c.estado)
                : ["Cancelada"];
              const estadoTerminal = c.estado === "Cancelada" || c.estado === "Cerrada";
              const puedeImprimir = user.rol !== "paciente" && c.estado !== "Solicitada" && c.estado !== "Cancelada";
              return (
                <tr key={c.id}>
                  <td><span className="bo-id">{c.codigo}</span></td>
                  <td className="fw-medium">{c.pacienteNombre}</td>
                  <td>{c.prestacion}</td>
                  <td>{c.centroNombre}</td>
                  <td>{c.boxNombre}</td>
                  <td>{formatearFechaHora(c.fecha, c.hora)}</td>
                  <td className="text-capitalize">{c.solicitadoPor === "paciente" ? "Paciente" : "Recepcionista"}</td>
                  <td><BadgeEstado estado={c.estado} /></td>
                  <td>
                    <div className="d-flex gap-1 justify-content-end align-items-center">
                      {!estadoTerminal && (
                        <select
                          className="form-select form-select-sm bo-select-sm"
                          value=""
                          disabled={cambiandoEstado === c.id || disponibles.length === 0}
                          onChange={(e) => e.target.value && cambiarEstado(c, e.target.value)}
                          aria-label={`Cambiar estado de ${c.codigo}`}
                        >
                          <option value="">Cambiar</option>
                          {disponibles.map((s) => (
                            <option key={s} value={s}>{s}{(s === "Cancelada" && user.rol === "paciente") ? " (solo con aviso al centro)" : ""}</option>
                          ))}
                        </select>
                      )}
                      {puedeImprimir && (
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-1"
                          title="Imprimir ticket de admisión"
                          aria-label={`Imprimir ticket de admisión de ${c.codigo}`}
                          onClick={() => setTicketCita(c)}
                        >
                          <i className="bi bi-printer"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </BoTable>
      </EstadoContenido>

      <CrearAtencionModal
        show={showCrear}
        onClose={() => setShowCrear(false)}
        onCreada={async () => { setShowCrear(false); await cargar(); }}
      />

      {ticketCita && (
        <Modal show onClose={() => setTicketCita(null)} title={`Ticket de admisión — ${ticketCita.codigo}`}>
          <TicketAdmision cita={ticketCita} />
          <div className="d-flex justify-content-end gap-2 mt-3 no-print">
            <button className="btn btn-outline-secondary" onClick={() => setTicketCita(null)}>Cerrar</button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i>Imprimir
            </button>
          </div>
        </Modal>
      )}

      <Modal
        show={!!cancelacionCita}
        onClose={() => setCancelacionCita(null)}
        title="Cancelar atención"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setCancelacionCita(null)}>
              No, mantener
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmarCancelacion}
              disabled={cambiandoEstado === cancelacionCita?.id}
            >
              {cambiandoEstado === cancelacionCita?.id ? "Cancelando…" : "Sí, cancelar"}
            </button>
          </>
        }
      >
        <p className="mb-0">
          ¿Cancelar la atención <strong>{cancelacionCita?.codigo}</strong>?
        </p>
      </Modal>
    </div>
  );
}

function CrearAtencionModal({ show, onClose, onCreada }) {
  const { user } = useAuth();
  const esPaciente = user.rol === "paciente";

  const [centros, setCentros] = useState([]);
  const [prestaciones, setPrestaciones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => ({
    centroId: "",
    prestacionId: "",
    fecha: hoyISO(),
    hora: "",
    pacienteNombre: esPaciente ? user.nombre : "",
    pacienteEmail: user.email || "",
    observaciones: "",
  }));

  useEffect(() => {
    if (!show) return;
    catalogoService.getCentros().then(setCentros);
    catalogoService.getPrestaciones().then(setPrestaciones);
  }, [show]);

  const centroSeleccionado = encontrarPorId(centros, form.centroId);
  const prestacionSeleccionada = encontrarPorId(prestaciones, form.prestacionId);

  const prestacionesFiltradas = useMemo(() => {
    if (!centroSeleccionado) return prestaciones;
    if (centroSeleccionado.tipo === "dental") return prestaciones.filter((p) => p.categoria === "dental");
    return prestaciones.filter((p) => p.categoria !== "dental");
  }, [prestaciones, centroSeleccionado]);

  // Carga los cupos cada vez que cambian centro/prestación/fecha
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!form.centroId || !form.prestacionId || !form.fecha) {
      setSlots([]);
      return;
    }
    setCargandoSlots(true);
    atencionesService
      .getSlots({ fecha: form.fecha, centroId: form.centroId, prestacionId: form.prestacionId })
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setCargandoSlots(false));
  }, [form.centroId, form.prestacionId, form.fecha]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const set = (k, v) => {
    const resetHora = k === "centroId" || k === "prestacionId";
    setForm((f) => (resetHora ? { ...f, [k]: v, hora: "" } : { ...f, [k]: v }));
  };

  const validar = () => {
    if (!form.centroId) return "Selecciona un centro de la red.";
    if (!form.prestacionId) return "Selecciona una prestación.";
    if (!form.fecha) return "Selecciona una fecha.";
    if (!form.hora) return "Selecciona un cupo (hora) disponible.";
    if (!form.pacienteNombre.trim()) return "Ingresa el nombre del paciente.";
    if (!form.pacienteEmail.trim()) return "Ingresa el email del paciente.";
    return "";
  };

  const guardar = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) { setError(err); return; }
    setError("");
    setGuardando(true);
    try {
      await atencionesService.create(
        {
          centroId: Number(form.centroId),
          prestacionId: Number(form.prestacionId),
          fecha: form.fecha,
          hora: form.hora,
          pacienteNombre: form.pacienteNombre.trim(),
          pacienteEmail: form.pacienteEmail.trim(),
          observaciones: form.observaciones,
          pacienteId: esPaciente ? user.id : undefined,
        },
        user
      );
      onCreada();
    } catch {
      setError("No se pudo agendar la atención. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const disponibilidad = slots.filter((s) => s.estado === "disponible");

  return (
    <ModalFormulario
      show={show}
      onClose={onClose}
      title={esPaciente ? "Agendar atención" : "Registrar atención"}
      size="modal-lg"
      onSubmit={guardar}
      error={error}
      guardando={guardando}
      textoGuardar={esPaciente ? "Solicitar atención" : "Confirmar atención"}
      textoGuardando="Agendando…"
      icono="bi-calendar2-plus"
    >
      <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Centro de la red</label>
            <select className="form-select" value={form.centroId} onChange={(e) => set("centroId", e.target.value)}>
              <option value="">Selecciona un centro…</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Prestación</label>
            <select className="form-select" value={form.prestacionId} onChange={(e) => set("prestacionId", e.target.value)}>
              <option value="">Selecciona prestación…</option>
              {prestacionesFiltradas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.duracionMin} min)</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Fecha</label>
            <input type="date" className="form-control" min={hoyISO()} value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Paciente</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre completo"
              value={form.pacienteNombre}
              onChange={(e) => set("pacienteNombre", e.target.value)}
              readOnly={esPaciente}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Email del paciente</label>
            <input
              type="email"
              className="form-control"
              placeholder="correo@paciente.cl"
              value={form.pacienteEmail}
              readOnly
              title={`Correo de la cuenta con la que iniciaste sesión (${user.email || "sín correo"})`}
            />
            <div className="form-text small">Se completa con el correo de tu cuenta de sesión.</div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Observaciones</label>
            <input type="text" className="form-control" placeholder="Opcional" value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)} />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold small">Cupo disponible — {prestacionSeleccionada ? `${prestacionSeleccionada.nombre} · ${prestacionSeleccionada.duracionMin} min` : ""}</label>
            {cargandoSlots ? (
              <Cargando texto="Consultando cupos…" />
            ) : slots.length === 0 ? (
              <div className="alert alert-light border small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                Selecciona centro, prestación y fecha para ver los cupos disponibles.
              </div>
            ) : disponibilidad.length === 0 ? (
              <div className="alert alert-warning small mb-0">
                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                No hay cupos disponibles para esta fecha. Elige otra fecha o prestación.
              </div>
            ) : (
              <div className="slot-grid">
                {slots.map((s) => (
                  <button
                    type="button"
                    key={s.hora}
                    className={`slot-chip${form.hora === s.hora ? " selected" : ""}`}
                    disabled={s.estado !== "disponible"}
                    onClick={() => set("hora", s.hora)}
                  >
                    {s.hora}
                    {s.estado !== "disponible" && <small>Ocupado</small>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {form.hora && (
          <div className="alert mock-alert small mt-3 mb-0">
            <i className="bi bi-info-circle me-1"></i>
            {esPaciente ? (
              <>Al confirmar, tu solicitud quedará <strong>pendiente de confirmación</strong> y recibirás una notificación por email/push.</>
            ) : (
              <>La atención quedará <strong>confirmada</strong> de inmediato y se notificará al paciente.</>
            )}
          </div>
        )}
    </ModalFormulario>
  );
}

function TicketAdmision({ cita }) {
  return (
    <div className="ticket-print">
      <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
        <div>
          <div className="fw-bold fs-5 c-heading">VidaSalud</div>
          <div className="small text-muted">Ticket de admisión</div>
        </div>
        <div className="text-end">
          <div className="fw-bold">{cita.codigo}</div>
          <div className="small text-muted">{formatearFecha(cita.fecha)} · {cita.hora}</div>
        </div>
      </div>
      <div className="row g-2 small">
        <div className="col-6"><div className="text-muted">Paciente</div><div className="fw-semibold">{cita.pacienteNombre}</div></div>
        <div className="col-6"><div className="text-muted">Prestación</div><div className="fw-semibold">{cita.prestacion}</div></div>
        <div className="col-6"><div className="text-muted">Centro</div><div className="fw-semibold">{cita.centroNombre}</div></div>
        <div className="col-6"><div className="text-muted">Box</div><div className="fw-semibold">{cita.boxNombre}</div></div>
        <div className="col-6"><div className="text-muted">Profesional</div><div className="fw-semibold">{cita.prestadorNombre}</div></div>
        <div className="col-6"><div className="text-muted">Duración estimada</div><div className="fw-semibold">{cita.duracionMin} min</div></div>
      </div>
      <div className="mt-3 small text-muted" style={{ borderTop: "1px dashed var(--border)", paddingTop: "0.6rem" }}>
        Preséntese 10 minutos antes de la hora indicada en caja/admisión de {cita.centroNombre}.
      </div>
    </div>
  );
}