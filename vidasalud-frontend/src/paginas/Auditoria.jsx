import { useCallback, useEffect, useState } from "react";
import { EstadoContenido } from "../componentes/Estado";
import BannerPagina from "../componentes/BannerPagina";
import BoTable from "../componentes/BoTable";
import CampoFiltro from "../componentes/CampoFiltro";
import { auditoriaService, TIPOS_EVENTO_AUDIT, ROL_LABELS, formatearFecha } from "../api.js";
import { ESTILO_TIPO, BANNERS } from "../componentes/Datos.js";
import { descargarCSV } from "../utilidades.js";

const FILTROS_VACIOS = { usuario: "", tipo: "Todos", desde: "", hasta: "" };

export default function Audit() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  const cargar = useCallback(async (f = filtros) => {
    setCargando(true);
    try {
      const data = await auditoriaService.getAll({
        usuario: f.usuario || undefined,
        tipo: f.tipo === "Todos" ? undefined : f.tipo,
        desde: f.desde || undefined,
        hasta: f.hasta || undefined,
      });
      setEventos(Array.isArray(data) ? data : []);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
  useEffect(() => { cargar(); }, [cargar]);

  const exportarCSV = () => {
    const filas = [
      ["Fecha", "Hora", "Usuario", "Rol", "Tipo de evento", "Descripción", "Entidad", "ID"],
      ...eventos.map((e) => [formatearFecha(e.fecha), e.hora, e.usuario, e.rol, e.tipo, e.descripcion, e.entidad, e.entidadId]),
    ];
    descargarCSV(filas, "auditoria-vidasalud.csv");
  };

  return (
    <div className="app-page app-page-narrow">
      <BannerPagina banner={BANNERS.auditoria} />
      <div className="app-header">
        <h2><i className="bi bi-shield-lock-fill me-2 c-primary"></i>Auditoría de eventos</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-success" onClick={exportarCSV} disabled={eventos.length === 0}>
            <i className="bi bi-file-earmark-arrow-down me-1"></i>Exportar CSV
          </button>
        </div>
      </div>

      <form
        className="bo-filter-bar"
        onSubmit={(e) => { e.preventDefault(); cargar(); }}
      >
        <CampoFiltro label="Usuario">
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Buscar por usuario…"
            value={filtros.usuario}
            onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
          />
        </CampoFiltro>
        <CampoFiltro label="Tipo de evento">
          <select className="form-select form-select-sm w-auto" value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
            <option value="Todos">Todos</option>
            {TIPOS_EVENTO_AUDIT.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </CampoFiltro>
        <CampoFiltro label="Desde">
          <input type="date" className="form-control form-control-sm w-auto" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
        </CampoFiltro>
        <CampoFiltro label="Hasta">
          <input type="date" className="form-control form-control-sm w-auto" value={filtros.hasta} onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })} />
        </CampoFiltro>
        <button type="submit" className="btn btn-sm btn-primary"><i className="bi bi-search me-1"></i>Aplicar</button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setFiltros(FILTROS_VACIOS)}
        >
          Limpiar
        </button>
      </form>

      <EstadoContenido
        cargando={cargando}
        textoCargando="Consultando trazabilidad…"
        vacio={eventos.length === 0}
        icono="bi-shield-x"
        mensaje="No hay eventos que coincidan con los filtros."
      >
        <BoTable columnas={["Fecha · Hora", "Usuario", "Rol", "Evento", "Entidad", "Descripción"]}>
            {eventos.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{formatearFecha(e.fecha)} · {e.hora}</td>
                <td className="fw-medium">{e.usuario}</td>
                <td><span className="badge bg-light text-dark">{ROL_LABELS[e.rol] || e.rol}</span></td>
                <td>
                  <span
                    className="bo-badge badge-dynamic"
                    style={{
                      "--badge-bg": ESTILO_TIPO[e.tipo]?.bg || "rgba(108,117,125,0.12)",
                      "--badge-color": ESTILO_TIPO[e.tipo]?.color || "#6c757d",
                      "--badge-border": "transparent",
                    }}
                  >
                    <i className={`bi ${ESTILO_TIPO[e.tipo]?.icono || "bi-record-circle"}`}></i>
                    {e.tipo}
                  </span>
                </td>
                <td>{e.entidad}{e.entidadId && e.entidadId !== "—" ? ` · ${e.entidadId}` : ""}</td>
                <td>{e.descripcion}</td>
              </tr>
            ))}
          </BoTable>
      </EstadoContenido>
    </div>
  );
}