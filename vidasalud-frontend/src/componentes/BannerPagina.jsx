import { fondoBanner } from "./Datos.js";

export default function BannerPagina({ banner }) {
  return (
    <div className="cuadro-pagina" role="img" aria-label={banner.alt} style={{ "--banner-img": fondoBanner(banner.seed) }} />
  );
}