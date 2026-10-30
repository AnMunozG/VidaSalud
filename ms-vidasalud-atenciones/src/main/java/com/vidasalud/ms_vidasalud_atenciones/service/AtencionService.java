package com.vidasalud.ms_vidasalud_atenciones.service;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import com.vidasalud.ms_vidasalud_atenciones.repository.AtencionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Reglas de negocio del módulo de atenciones.
 *
 * <p>Se eliminó la "Regla de Negocio" que descontaba cupo en ms-vidasalud-catalogo
 * al confirmar una atención: apuntaba a una URL inexistente
 * ({@code /api/catalog/services/{id}/descontar-cupo}) y a {@code localhost:8081},
 * que dentro de Docker apunta al propio contenedor. Hasta que el catálogo exponga
 * ese endpoint, la transición de estado solo persiste el nuevo estado.</p>
 *
 * <p>Eventos de notificación publicados en RabbitMQ para que
 * ms-vidasalud-notify los procese:</p>
 * <ul>
 *   <li>Crear atención -&gt; flujo {@code admission} (ticket de admisión).</li>
 *   <li>Cambiar estado -&gt; flujo {@code email} (email/push al paciente).</li>
 *   <li>Imprimir -&gt; flujo {@code record} (generación del PDF).</li>
 * </ul>
 *
 * <p>El PDF del comprobante lo genera este servicio (ver
 * {@link AtencionPdfService}) y se devuelve en la misma respuesta HTTP; además
 * se publica el evento {@code record} en RabbitMQ para el flujo de
 * notificaciones.</p>
 *
 * <p>El envío a RabbitMQ es best-effort: si el broker no está disponible, la
 * operación de negocio no falla.</p>
 */
@Service
@RequiredArgsConstructor
public class AtencionService {

    private static final String EVENTO_CREADA = "ATENCION_CREADA";
    private static final String EVENTO_ESTADO = "ATENCION_ESTADO_CAMBIADO";
    private static final String EVENTO_IMPRESA = "ATENCION_IMPRESA";

    private enum FlujoNotificacion {
        ADMISSION, EMAIL, RECORD
    }

    private final AtencionRepository repository;
    private final NotificationPublisher notificationPublisher;
    private final AtencionPdfService pdfService;

    public List<Atencion> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Atencion> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public List<Atencion> obtenerPorEstado(String estado) {
        return repository.findByEstado(estado);
    }

    public Atencion crear(Atencion atencion) {
        if (atencion.getEstado() == null) {
            atencion.setEstado("SOLICITADA");
        }
        Atencion guardada = repository.save(atencion);
        notificar(EVENTO_CREADA, guardada, FlujoNotificacion.ADMISSION);
        return guardada;
    }

    public Optional<Atencion> cambiarEstado(Long id, String nuevoEstado) {
        return repository.findById(id).map(atencion -> {
            atencion.setEstado(nuevoEstado);
            Atencion guardada = repository.save(atencion);
            notificar(EVENTO_ESTADO, guardada, FlujoNotificacion.EMAIL);
            return guardada;
        });
    }

    /**
     * Genera el comprobante PDF de la atención y publica el evento
     * {@code ATENCION_IMPRESA} en el flujo {@code record}.
     *
     * <p>La generación es síncrona para poder devolver el archivo en la misma
     * respuesta HTTP; el evento permite que ms-vidasalud-notify registre/envíe
     * la notificación asociada.</p>
     */
    public Optional<byte[]> generarPdf(Long id) {
        return repository.findById(id).map(atencion -> {
            byte[] pdf = pdfService.generar(atencion);
            notificar(EVENTO_IMPRESA, atencion, FlujoNotificacion.RECORD);
            return pdf;
        });
    }

    public boolean eliminar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    private void notificar(String tipoEvento, Atencion atencion, FlujoNotificacion flujo) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("atencionId", atencion.getId());
        payload.put("pacienteId", atencion.getPacienteId());
        payload.put("pacienteNombre", atencion.getPacienteNombre());
        payload.put("to", atencion.getPacienteEmail());
        payload.put("prestacionId", atencion.getPrestacionId());
        payload.put("fechaHora", atencion.getFechaHora() != null ? atencion.getFechaHora().toString() : null);
        payload.put("estado", atencion.getEstado());
        payload.put("centroId", atencion.getCentroId());
        payload.put("subject", asunto(tipoEvento));
        payload.put("body", cuerpo(tipoEvento, atencion));
        if (flujo == FlujoNotificacion.RECORD) {
            payload.put("documento", "RESUMEN_ATENCION");
        }

        switch (flujo) {
            case ADMISSION -> notificationPublisher.publicarAdmision(tipoEvento, payload);
            case EMAIL -> notificationPublisher.publicarEmail(tipoEvento, payload);
            case RECORD -> notificationPublisher.publicarRecord(tipoEvento, payload);
        }
    }

    private String asunto(String tipoEvento) {
        return switch (tipoEvento) {
            case EVENTO_CREADA -> "VidaSalud - Atención registrada";
            case EVENTO_IMPRESA -> "VidaSalud - Resumen de atención";
            default -> "VidaSalud - Estado de atención actualizado";
        };
    }

    private String cuerpo(String tipoEvento, Atencion atencion) {
        String paciente = atencion.getPacienteNombre() != null
                ? atencion.getPacienteNombre()
                : atencion.getPacienteId();
        return switch (tipoEvento) {
            case EVENTO_CREADA -> "Hola " + paciente + ", tu atención #" + atencion.getId()
                    + " quedó registrada en estado " + atencion.getEstado() + ".";
            case EVENTO_IMPRESA -> "Hola " + paciente + ", se generó el resumen de tu atención #"
                    + atencion.getId() + ".";
            default -> "Hola " + paciente + ", tu atención #" + atencion.getId()
                    + " cambió al estado " + atencion.getEstado() + ".";
        };
    }
}
