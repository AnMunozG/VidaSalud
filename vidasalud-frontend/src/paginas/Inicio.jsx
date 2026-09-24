import { useEffect } from "react";
import { Link } from "react-router-dom";
import BadgeEstado from "../componentes/BadgeEstado";
import { SERVICIOS, BENEFICIOS, TESTIMONIOS, FAQ, fondoLanding, imagenServicio } from "../componentes/Datos.js";

function Eyebrow({ children }) {
  return <span className="inicio-eyebrow">{children}</span>;
}

function SeccionHead({ eyebrow, titulo, descripcion }) {
  return (
    <div className="inicio-section-head" data-reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{titulo}</h2>
      {descripcion && <p className="inicio-section-sub">{descripcion}</p>}
    </div>
  );
}

export default function Inicio() {
  useEffect(() => {
    const obsReveal = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obsReveal.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => obsReveal.observe(el));

    const obsContador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const fin = parseInt(el.dataset.fin, 10) || 0;
          const prefijo = el.dataset.prefijo || "";
          const sufijo = el.dataset.sufijo || "";
          const dur = 1400;
          const t0 = performance.now();
          const paso = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = `${prefijo}${Math.round(fin * eased).toLocaleString("es-CL")}${sufijo}`;
            if (p < 1) requestAnimationFrame(paso);
          };
          requestAnimationFrame(paso);
          obsContador.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-contador]").forEach((el) => obsContador.observe(el));

    return () => {
      obsReveal.disconnect();
      obsContador.disconnect();
    };
  }, []);

  return (
    <div className="inicio">
      <section className="inicio-hero" style={{ "--banner-img": fondoLanding("hero") }}>
        <div className="inicio-hero-grid">
          <div className="inicio-hero-copy">
            <Eyebrow>Red de atención primaria y salud oral</Eyebrow>
            <h1>
              Cuidamos tu salud,{" "}
              <span className="inicio-hero-grad">cuando y donde la necesites</span>
            </h1>
            <p className="inicio-hero-sub">
              VidaSalud conecta 20 centros de atención primaria y odontología con una agenda en línea
              simple: elige tu prestación, reserva tu hora y recibe recordatorios automáticos.
            </p>
            <div className="inicio-hero-ctas">
              <Link to="/login" className="btn btn-lg btn-accent inicio-btn">
                <i className="bi bi-calendar2-plus me-2"></i>Agendar mi hora
              </Link>
              <Link to="/login" className="btn btn-lg btn-outline-light inicio-btn-outline">
                <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
              </Link>
            </div>
            <div className="inicio-hero-badges">
              <span className="inicio-mini-badge">
                <i className="bi bi-check-circle-fill me-1"></i>FONASA
              </span>
              <span className="inicio-mini-badge">
                <i className="bi bi-check-circle-fill me-1"></i>ISAPRE
              </span>
              <span className="inicio-mini-badge">
                <i className="bi bi-check-circle-fill me-1"></i>Particular
              </span>
            </div>
          </div>

          <div className="inicio-hero-visual">
            <div className="hero-mock cita-card">
              <div className="cita-card-head">
                <span className="cita-card-tag">
                  <i className="bi bi-heart-pulse-fill anima-latido me-1"></i>En curso
                </span>
                <span className="cita-card-ok" aria-hidden="true">
                  <i className="bi bi-shield-fill-check"></i>
                </span>
              </div>
              <div className="cita-card-titulo">Control de salud integral</div>
              <div className="cita-card-linea">
                <i className="bi bi-geo-alt-fill c-primary"></i>VidaSalud Providencia · Box 3
              </div>
              <div className="cita-card-linea">
                <i className="bi bi-calendar3 c-primary"></i>Jueves 17 · 09:30 hrs
              </div>
              <div className="cita-card-estados">
                <BadgeEstado estado="Confirmada" />
                <BadgeEstado estado="En espera" />
                <BadgeEstado estado="Atendida" />
              </div>
              <div className="cita-card-progreso">
                <div className="cita-card-bar" style={{ width: "62%" }}></div>
              </div>
              <div className="cita-card-chip-row">
                <span className="cita-chip">
                  <i className="bi bi-alarm-fill"></i>Sin esperas
                </span>
                <span className="cita-chip">
                  <i className="bi bi-clipboard2-check-fill"></i>Ficha digital
                </span>
              </div>
              <div className="cita-card-pie">
                <span>
                  <i className="bi bi-bell-fill c-accent me-1"></i>Recordatorio enviado
                </span>
              </div>
            </div>
          </div>
        </div>

        <a href="#servicios" className="inicio-scroll" aria-label="Desplazarse a servicios">
          <i className="bi bi-chevron-down"></i>
        </a>
      </section>

      <section className="inicio-stats" aria-label="Cifras de VidaSalud">
        <div className="inicio-stats-grid">
          <div className="inicio-stat" data-reveal>
            <div className="inicio-stat-num" data-contador data-fin="20" data-sufijo=""></div>
            <div className="inicio-stat-label">Centros de salud</div>
          </div>
          <div className="inicio-stat" data-reveal style={{ "--rd": "0.08s" }}>
            <div className="inicio-stat-num" data-contador data-fin="15" data-sufijo=""></div>
            <div className="inicio-stat-label">Prestaciones de salud</div>
          </div>
          <div className="inicio-stat" data-reveal style={{ "--rd": "0.16s" }}>
            <div className="inicio-stat-num" data-contador data-fin="40" data-prefijo="+" data-sufijo=" mil"></div>
            <div className="inicio-stat-label">Pacientes al año</div>
          </div>
          <div className="inicio-stat" data-reveal style={{ "--rd": "0.24s" }}>
            <div className="inicio-stat-num" data-contador data-fin="98" data-sufijo="%"></div>
            <div className="inicio-stat-label">Satisfacción</div>
          </div>
        </div>
      </section>

      <section className="inicio-section" id="vidasalud">
        <div className="inicio-container">
          <div className="inicio-duo">
            <div className="inicio-duo-visual" data-reveal>
              <div className="inicio-mision-card" style={{ "--banner-img": fondoLanding("mision") }}>
                <Eyebrow>Nuestra misión</Eyebrow>
                <p className="inicio-mision-texto">
                  Acercar la atención de salud a cada hogar, un centro a la vez, mejorando la
                  experiencia de pacientes y equipos médicos.
                </p>
                <ul className="inicio-checks">
                  {["Confirmación inmediata", "Recordatorios por email y push", "Ficha médica digital", "Sala de espera en tiempo real"].map((t) => (
                    <li key={t}>
                      <i className="bi bi-check2-all c-accent me-2"></i>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="inicio-duo-copy" data-reveal style={{ "--rd": "0.15s" }}>
              <SeccionHead
                eyebrow="VidaSalud"
                titulo="Atenderte cerca de tu hogar, sin filas y sin llamadas"
                descripcion="Conectamos los avances de la atención primaria con una agenda digital simple. Tú eliges el centro, el profesional y la hora; nosotros nos encargamos del resto."
              />
              <div className="row g-3">
                {BENEFICIOS.slice(0, 4).map((b) => (
                  <div className="col-md-6" key={b.titulo} data-reveal style={{ "--rd": "0.1s" }}>
                    <div className="inicio-benefit-card">
                      <div className="inicio-icon-figura">
                        <i className={`bi ${b.icono}`}></i>
                      </div>
                      <div className="fw-semibold c-heading">{b.titulo}</div>
                      <p className="small c-muted mb-0">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="inicio-section inicio-section-alt" id="servicios">
        <div className="inicio-container">
          <SeccionHead
            eyebrow="Nuestros servicios"
            titulo="Prestaciones de atención primaria y salud oral"
            descripcion="Cada prestación se agenda en línea y se coordina dentro de tu centro de la red, con la misma ficha digital en todo el país."
          />
          <div className="row g-4">
            {SERVICIOS.map((s, i) => (
              <div className="col-md-6 col-lg-4" key={s.nombre} data-reveal style={{ "--rd": `${i * 0.07}s` }}>
                <div className="inicio-servicio-card">
                  <img
                    src={imagenServicio(i) || `https://picsum.photos/seed/vidasalud-serv-${i}/900/700`}
                    alt={`Servicio de ${s.nombre}`}
                    className="servicio-img"
                    loading="lazy"
                  />
                  <div className="inicio-icon-figura inicio-icon-figura-lg">
                    <i className={`bi ${s.icono}`}></i>
                  </div>
                  <h3>{s.nombre}</h3>
                  <p>{s.desc}</p>
                  <Link to="/login" className="inicio-icono-link">
                    Agendar <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inicio-section" id="testimonios">
        <div className="inicio-container">
        <SeccionHead
          eyebrow="Historias reales"
          titulo="Nuestros pacientes cuentan cómo fue"
        />
          <div className="row g-4">
            {TESTIMONIOS.map((t, i) => (
              <div className="col-md-4" key={t.nombre} data-reveal style={{ "--rd": `${i * 0.1}s` }}>
                <div className="inicio-testimonio-card">
                  <div className="inicio-estrellas">
                    {Array.from({ length: 5 }, (_, n) => (
                      <i className="bi bi-star-fill" key={n}></i>
                    ))}
                  </div>
                  <p className="inicio-testimonio-cita">“{t.cita}”</p>
                  <div className="d-flex align-items-center gap-2">
                    <div className="inicio-avatar">{t.nombre.charAt(0)}</div>
                    <div>
                      <div className="fw-semibold">{t.nombre}</div>
                      <div className="small c-muted">{t.rol}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inicio-section" id="preguntas">
        <div className="inicio-container inicio-container-narrow">
          <SeccionHead eyebrow="Preguntas frecuentes" titulo="Resolvemos tus dudas" />
          <div className="inicio-faq">
            {FAQ.map((f) => (
              <details className="inicio-faq-item" key={f.pregunta} data-reveal>
                <summary>
                  {f.pregunta}
                  <i className="bi bi-plus-lg"></i>
                </summary>
                <p>{f.respuesta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="inicio-cta" id="agenda">
        <div className="inicio-cta-panel" data-reveal style={{ "--banner-img": fondoLanding("cta") }}>
          <div className="inicio-cta-icono">
            <i className="bi bi-heart-pulse-fill anima-latido"></i>
          </div>
          <h2>¿Listo para agendar tu próxima atención?</h2>
          <p>Ingresa con tu cuenta y reserva tu hora en menos de dos minutos.</p>
          <div className="inicio-hero-ctas">
            <Link to="/login" className="btn btn-lg btn-primary inicio-btn">
              <i className="bi bi-calendar2-plus me-2"></i>Agendar mi hora
            </Link>
            <Link to="/login" className="btn btn-lg btn-outline-primary inicio-btn-outline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}