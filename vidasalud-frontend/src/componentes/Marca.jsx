import { Link } from "react-router-dom";

export default function Marca({ to = "", sub = "Red de atención primaria", ocultarEnMovil = false, extraClase = "" }) {
  const contenido = (
    <>
      <span className="vs-brand-mark">
        <img src="/favicon.png" alt="" width="40" height="40" />
      </span>
      <span className={`vs-brand-text${ocultarEnMovil ? " d-none d-sm-block" : ""}`}>
        <span className="vs-brand-name d-block">VidaSalud</span>
        <span className="vs-brand-sub d-block">{sub}</span>
      </span>
    </>
  );
  const clase = `vs-brand${extraClase ? ` ${extraClase}` : ""}`;
  return to ? (
    <Link to={to} className={clase} aria-label="VidaSalud">
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  );
}