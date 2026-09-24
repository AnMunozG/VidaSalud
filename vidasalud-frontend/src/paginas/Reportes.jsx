import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { EstadoVacio, EstadoContenido } from "../componentes/Estado";
import BannerPagina from "../componentes/BannerPagina";
import { reportesService } from "../api.js";
import { rechartsTooltip, BANNERS } from "../componentes/Datos.js";
import { hoyISO, sumarDias } from "../constants.js";
import { descargarCSV } from "../utilidades.js";

export default function Reports() {
  const [desde, setDesde] = useState(sumarDias(-30));
  const [hasta, setHasta] = useState(hoyISO());
  const [cargando, setCargando] = useState(true);
  const [porHora, setPorHora] = useState([]);
  const [tiempos, setTiempos] = useState([]);
  const [demanda, setDemanda] = useState([]);

  const cargar = (d = desde, h = hasta) => {
    setCargando(true);
    Promise.all([
      reportesService.porHora({ desde: d, hasta: h }),
      reportesService.tiemposEspera({ desde: d, hasta: h }),
      reportesService.prestacionesDemandadas({ desde: d, hasta: h }),
    ])
      .then(([a, b, c]) => {
        setPorHora(Array.isArray(a) ? a : []);
        setTiempos(Array.isArray(b) ? b : []);
        setDemanda(Array.isArray(c) ? c : []);
      })
      .finally(() => setCargando(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalAtenciones = porHora.reduce((a, x) => a + x.atenciones, 0);
  const promEspera = tiempos.length
    ? Math.round(tiempos.reduce((a, x) => a + x.promedioMin, 0) / tiempos.length)
    : 0;

  const resumen = [
    { label: "Atenciones en el periodo", value: totalAtenciones },
    { label: "Tiempo de espera prom.", value: `${promEspera} min` },
    { label: "Prestaciones distintas", value: demanda.filter((d) => d.cantidad > 0).length },
  ];

  const exportarCSV = () => {
    const filas = [
      ["Atenciones por hora", `Desde ${desde} hasta ${hasta}`],
      ["Rango", "Atenciones"],
      ...porHora.map((r) => [r.name, r.atenciones]),
      [],
      ["Tiempo de espera promedio (min)"],
      ["Fecha", "Promedio (min)"],
      ...tiempos.map((r) => [r.fecha, r.promedioMin]),
      [],
      ["Prestaciones más demandadas"],
      ["Prestación", "Cantidad"],
      ...demanda.map((r) => [r.name, r.cantidad]),
    ];
    descargarCSV(filas, `reporte-vidasalud_${desde}_${hasta}.csv`);
  };

  return (
    <div className="app-page">
      <BannerPagina banner={BANNERS.reportes} />
      <div className="app-header">
        <h2><i className="bi bi-bar-chart-fill me-2 c-primary"></i>Reportería de operaciones</h2>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <label className="form-label m-0 small c-muted">Desde:</label>
          <input type="date" className="form-control form-control-sm w-auto" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <label className="form-label m-0 small c-muted">Hasta:</label>
          <input type="date" className="form-control form-control-sm w-auto" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={() => cargar()}>
            <i className="bi bi-search me-1"></i>Filtrar
          </button>
          <button className="btn btn-sm btn-outline-success" onClick={exportarCSV}>
            <i className="bi bi-file-earmark-arrow-down me-1"></i>Exportar CSV
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {resumen.map((s, i) => (
          <div className="col-sm-4" key={i}>
            <div className="stat-card">
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <EstadoContenido cargando={cargando} textoCargando="Generando reportes…">
        <div className="row g-3">
          <div className="col-lg-7">
            <div className="bo-chart-card h-100">
              <h5 className="mb-3 c-heading"><i className="bi bi-clock-history me-2 c-primary"></i>Atenciones por hora del día</h5>
              {porHora.length === 0 ? (
                <EstadoVacio mensaje="Sin datos en el periodo seleccionado." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={porHora}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-35} textAnchor="end" height={70} />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                    <Tooltip contentStyle={rechartsTooltip} />
                    <Line type="monotone" dataKey="atenciones" stroke="#0E7C86" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="bo-chart-card h-100">
              <h5 className="mb-3 c-heading"><i className="bi bi-stopwatch me-2 c-primary"></i>Prestaciones más demandadas</h5>
              {demanda.length === 0 ? (
                <EstadoVacio mensaje="Sin datos en el periodo seleccionado." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demanda} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <Tooltip contentStyle={rechartsTooltip} />
                    <Bar dataKey="cantidad" fill="#4EC3C9" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="bo-chart-card">
              <h5 className="mb-3 c-heading"><i className="bi bi-hourglass-split me-2 c-primary"></i>Tiempo de espera promedio (min) por día</h5>
              {tiempos.length === 0 ? (
                <EstadoVacio mensaje="Sin mediciones de espera en el periodo." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={tiempos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="fecha" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                    <Tooltip contentStyle={rechartsTooltip} />
                    <Line type="monotone" dataKey="promedioMin" name="Promedio (min)" stroke="#E8A33D" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </EstadoContenido>
    </div>
  );
}