import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../componentes/AuthContext";
import { Cargando, EstadoVacio, EstadoContenido } from "../componentes/Estado";
import ModalFormulario from "../componentes/ModalFormulario";
import FechaHoy from "../componentes/FechaHoy";
import BadgeBloqueado from "../componentes/BadgeBloqueado";
import BannerPagina from "../componentes/BannerPagina";
import BoTable from "../componentes/BoTable";
import CampoFiltro from "../componentes/CampoFiltro";
import { catalogoService } from "../api.js";
import { CATEGORIAS, TABS, hoyISO, BANNERS } from "../componentes/Datos.js";
import { encontrarPorId, mismoId } from "../utilidades.js";

export default function Catalog() {
  const { user } = useAuth();
  const esAdmin = user.rol === "admin";

  const [tab, setTab] = useState("prestaciones");

  return (
    <div className="app-page">
      <BannerPagina banner={BANNERS.catalogo} />
      <div className="app-header">
        <h2><i className="bi bi-box-seam-fill me-2 c-primary"></i>Catálogo de prestaciones</h2>
        <FechaHoy />
      </div>

      <div className="d-flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`btn btn-sm ${tab === t.id ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setTab(t.id)}
          >
            <i className={`bi ${t.icon} me-1`}></i>{t.label}
          </button>
        ))}
      </div>

      {tab === "prestaciones" && <PrestacionesTab esAdmin={esAdmin} />}
      {tab === "boxes" && <BoxesTab esAdmin={esAdmin} />}
      {tab === "cupos" && <CuposTab />}
    </div>
  );
}

// ── Prestaciones ──────────────────────────────────────────
function PrestacionesTab({ esAdmin }) {
  const { user } = useAuth();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", categoria: "medicina", duracionMin: 20, requiereBox: true, activa: true });
  const [error, setError] = useState("");

  const cargar = useCallback(() => catalogoService.getPrestaciones().then(setLista).finally(() => setCargando(false)), []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (!Number(form.duracionMin) || Number(form.duracionMin) <= 0) { setError("La duración debe ser mayor a 0."); return; }
    try {
      await catalogoService.createPrestacion({ ...form, duracionMin: Number(form.duracionMin) }, user);
      setShowModal(false);
      cargar();
    } catch {
      setError("No se pudo guardar la prestación.");
    }
  };

  const alternar = async (p) => {
    await catalogoService.updatePrestacion(p.id, { activa: !p.activa });
    cargar();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="c-muted small">{lista.length} prestaciones en el catálogo</span>
        {esAdmin && (
          <button className="btn btn-sm btn-success" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i>Nueva prestación
          </button>
        )}
      </div>

      <EstadoContenido cargando={cargando} vacio={lista.length === 0} icono="bi-clipboard2-x" mensaje="No hay prestaciones registradas.">
        <BoTable columnas={["ID", "Nombre", "Categoría", "Duración", "Requerimiento", "Estado", ...(esAdmin ? [{ texto: "Acciones", clase: "bo-actions-th" }] : [])]}>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td><span className="bo-id">{p.id}</span></td>
                  <td className="fw-medium">{p.nombre}</td>
                  <td className="text-capitalize">{p.categoria}</td>
                  <td>{p.duracionMin} min</td>
                  <td>{p.requiereBox ? <i className="bi bi-door-open text-primary" title="Requiere box"></i> : <span className="text-muted">—</span>}</td>
                  <td>
                    <BadgeBloqueado activo={p.activa} textoActivo="Activa" textoInactivo="Inactiva" />
                  </td>
                  {esAdmin && (
                    <td>
                      <button className="btn btn-sm btn-outline-secondary py-0 px-1" onClick={() => alternar(p)} title={p.activa ? "Desactivar" : "Activar"} aria-label={p.activa ? `Desactivar ${p.nombre}` : `Activar ${p.nombre}`}>
                        <i className={`bi ${p.activa ? "bi-pause-circle" : "bi-play-circle"}`}></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </BoTable>
      </EstadoContenido>

      <ModalFormulario show={showModal} onClose={() => setShowModal(false)} title="Nueva prestación" onSubmit={guardar} error={error}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Nombre</label>
            <input type="text" className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Control de embarazo" />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Categoría</label>
              <select className="form-select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c} value={c} className="text-capitalize">{c}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Duración (min)</label>
              <input type="number" min="5" step="5" className="form-control" value={form.duracionMin} onChange={(e) => setForm({ ...form, duracionMin: e.target.value })} />
            </div>
          </div>
          <div className="form-check form-switch mb-3">
            <input className="form-check-input" type="checkbox" id="reqBox" checked={form.requiereBox} onChange={(e) => setForm({ ...form, requiereBox: e.target.checked })} />
            <label className="form-check-label small" htmlFor="reqBox">Requiere un box clínico</label>
          </div>
      </ModalFormulario>
    </>
  );
}

// ── Boxes ─────────────────────────────────────────────────
function BoxesTab({ esAdmin }) {
  const { user } = useAuth();
  const [centros, setCentros] = useState([]);
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ centroId: "", nombre: "", tipo: "atención" });
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    setCargando(true);
    Promise.all([catalogoService.getCentros(), catalogoService.getBoxes()])
      .then(([ces, bx]) => { setCentros(ces); setLista(bx); })
      .finally(() => setCargando(false));
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
  useEffect(() => { cargar(); }, [cargar]);

  const nombreCentro = (id) => encontrarPorId(centros, id)?.nombre || `Centro ${id}`;

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.centroId) { setError("Selecciona el centro."); return; }
    if (!form.nombre.trim()) { setError("El nombre es obligatorio."); return; }
    try {
      await catalogoService.createBox({ ...form, centroId: Number(form.centroId) }, user);
      setShowModal(false);
      cargar();
    } catch {
      setError("No se pudo guardar el box.");
    }
  };

  const alternar = async (b) => {
    await catalogoService.updateBox(b.id, { activo: !b.activo });
    cargar();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="c-muted small">{lista.length} boxes operativos</span>
        {esAdmin && (
          <button className="btn btn-sm btn-success" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i>Nuevo box
          </button>
        )}
      </div>

      <EstadoContenido cargando={cargando}>
        <BoTable columnas={["Código", "Nombre", "Centro", "Tipo", "Estado", ...(esAdmin ? [{ texto: "Acciones", clase: "bo-actions-th" }] : [])]}>
              {lista.map((b) => (
                <tr key={b.id}>
                  <td><span className="bo-id">{b.id}</span></td>
                  <td className="fw-medium">{b.nombre}</td>
                  <td>{nombreCentro(b.centroId)}</td>
                  <td className="text-capitalize">{b.tipo}</td>
                  <td>
                    <BadgeBloqueado activo={b.activo} />
                  </td>
                  {esAdmin && (
                    <td>
                      <button className="btn btn-sm btn-outline-secondary py-0 px-1" onClick={() => alternar(b)} title={b.activo ? "Desactivar" : "Activar"} aria-label={b.activo ? `Desactivar ${b.nombre}` : `Activar ${b.nombre}`}>
                        <i className={`bi ${b.activo ? "bi-pause-circle" : "bi-play-circle"}`}></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </BoTable>
      </EstadoContenido>

      <ModalFormulario show={showModal} onClose={() => setShowModal(false)} title="Nuevo box clínico" onSubmit={guardar} error={error}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Centro</label>
            <select className="form-select" value={form.centroId} onChange={(e) => setForm({ ...form, centroId: e.target.value })}>
              <option value="">Selecciona…</option>
              {centros.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Nombre</label>
            <input type="text" className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Box 5, Box Dental 2" />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Tipo</label>
            <select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="atención">Atención</option>
              <option value="dental">Dental</option>
              <option value="procedimiento">Procedimiento</option>
            </select>
          </div>
      </ModalFormulario>
    </>
  );
}

// ── Cupos ─────────────────────────────────────────────────
function CuposTab() {
  const { user } = useAuth();
  const [centros, setCentros] = useState([]);
  const [prestaciones, setPrestaciones] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [form, setForm] = useState({ centroId: "", prestacionId: "", fecha: hoyISO(), boxId: "" });
  const [slots, setSlots] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    Promise.all([catalogoService.getCentros(), catalogoService.getPrestaciones(), catalogoService.getBoxes()]).then(([ces, pres, bxs]) => {
      setCentros(ces);
      setPrestaciones(pres);
      setBoxes(bxs);
    });
  }, []);

  const boxSel = encontrarPorId(boxes, form.boxId);

  const consultar = async (e) => {
    if (e) e.preventDefault();
    setSlots(null);
    setMensaje("");
    if (!form.centroId || !form.prestacionId) return;
    setCargando(true);
    try {
      const data = await catalogoService.getCupos({ fecha: form.fecha, centroId: form.centroId, prestacionId: form.prestacionId });
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setCargando(false);
    }
  };

  const generar = async () => {
    if (!form.boxId) { setMensaje("Selecciona un box para generar los cupos."); return; }
    setGenerando(true);
    setMensaje("");
    try {
      await catalogoService.generarCupos({ fecha: form.fecha, prestacionId: form.prestacionId, boxId: form.boxId }, user);
      setMensaje(`Cupos generados para ${boxSel?.nombre || form.boxId} el ${form.fecha}.`);
      await consultar();
    } finally {
      setGenerando(false);
    }
  };

  const disponibles = slots ? slots.filter((s) => s.estado === "disponible").length : 0;
  const ocupados = slots ? slots.length - disponibles : 0;

  return (
    <>
      <form onSubmit={consultar} className="bo-filter-bar">
        <CampoFiltro label="Centro">
          <select className="form-select form-select-sm w-auto" value={form.centroId} onChange={(e) => setForm({ ...form, centroId: e.target.value, boxId: "" })}>
            <option value="">Todos los centros…</option>
            {centros.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </CampoFiltro>
        <CampoFiltro label="Prestación">
          <select className="form-select form-select-sm w-auto" value={form.prestacionId} onChange={(e) => setForm({ ...form, prestacionId: e.target.value })}>
            <option value="">Selecciona…</option>
            {prestaciones.filter((p) => p.activa).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </CampoFiltro>
        <CampoFiltro label="Fecha">
          <input type="date" className="form-control form-control-sm w-auto" min={hoyISO()} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </CampoFiltro>
        <button type="submit" className="btn btn-sm btn-primary">
          <i className="bi bi-search me-1"></i>Consultar cupos
        </button>
      </form>

      {mensaje && !cargando && (
        <div className="alert alert-success small py-2"><i className="bi bi-check-circle-fill me-1"></i>{mensaje}</div>
      )}

      {cargando && <Cargando texto="Consultando cupos…" />}

      {slots && !cargando && (
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="bo-chart-card">
              <h5 className="mb-3 c-heading">
                <i className="bi bi-calendar-range-fill me-2 c-primary"></i>
                Cupos {form.fecha} — <span className="text-capitalize">{encontrarPorId(prestaciones, form.prestacionId)?.nombre}</span>
              </h5>
              {slots.length === 0 ? (
                <EstadoVacio icon="bi-calendar-x" mensaje="Sin cupos configurados para esta fecha y prestación.">
                  {form.centroId && (
                    <button className="btn btn-sm btn-outline-success mt-2" onClick={generar} disabled={generando}>
                      <i className="bi bi-magic me-1"></i>{generando ? "Generando…" : "Generar cupos"}
                    </button>
                  )}
                </EstadoVacio>
              ) : (
                <>
                  <div className="slot-grid mb-3">
                    {slots.map((s) => (
                      <div key={s.hora} className="slot-chip" style={s.estado === "ocupado" ? { cursor: "default" } : {}}>
                        {s.hora}
                        <small style={{ color: s.estado === "ocupado" ? "var(--danger)" : "var(--accent)" }}>
                          {s.estado === "ocupado" ? "Ocupado" : "Disponible"}
                        </small>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <span className="badge bg-success">{disponibles} disponibles</span>{" "}
                      <span className="badge bg-danger">{ocupados} ocupados</span>
                    </small>
                    <div className="d-flex gap-2 align-items-center">
                      <select className="form-select form-select-sm w-auto" value={form.boxId} onChange={(e) => setForm({ ...form, boxId: e.target.value })}>
                        <option value="">Box para generar…</option>
                        {boxes.filter((b) => !form.centroId || mismoId(b.centroId, form.centroId)).map((b) => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                      </select>
                      <button className="btn btn-sm btn-success" onClick={generar} disabled={generando}>
                        <i className="bi bi-magic me-1"></i>{generando ? "Generando…" : "Generar cupos"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="bo-chart-card h-100">
              <h5 className="mb-3 c-heading"><i className="bi bi-graph-up-arrow me-2 c-primary"></i>Resumen</h5>
              <div className="d-grid gap-2">
                <div className="d-flex justify-content-between"><span className="c-muted">Cupos totales</span><strong>{slots.length}</strong></div>
                <div className="d-flex justify-content-between"><span className="c-muted">Disponibles</span><strong className="text-success">{disponibles}</strong></div>
                <div className="d-flex justify-content-between"><span className="c-muted">Ocupados</span><strong className="text-danger">{ocupados}</strong></div>
                <div className="d-flex justify-content-between"><span className="c-muted">Ocupación</span><strong>{slots.length ? Math.round((ocupados / slots.length) * 100) : 0}%</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}