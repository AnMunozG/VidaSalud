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
 * <p>Al crear una atención o cambiar su estado se publica un evento en
 * RabbitMQ para que ms-vidasalud-notify lo procese. El envío es best-effort:
 * si el broker no está disponible, la operación de negocio no falla.</p>
 */
@Service
@RequiredArgsConstructor
public class AtencionService {

    private static final String EVENTO_CREADA = "ATENCION_CREADA";
    private static final String EVENTO_ESTADO = "ATENCION_ESTADO_CAMBIADO";

    private final AtencionRepository repository;
    private final NotificationPublisher notificationPublisher;

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
        notificar(EVENTO_CREADA, guardada);
        return guardada;
    }

    public Optional<Atencion> cambiarEstado(Long id, String nuevoEstado) {
        return repository.findById(id).map(atencion -> {
            atencion.setEstado(nuevoEstado);
            Atencion guardada = repository.save(atencion);
            notificar(EVENTO_ESTADO, guardada);
            return guardada;
        });
    }

    public boolean eliminar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    private void notificar(String tipoEvento, Atencion atencion) {
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
        notificationPublisher.publicar(tipoEvento, payload);
    }

    private String asunto(String tipoEvento) {
        return EVENTO_CREADA.equals(tipoEvento)
                ? "VidaSalud - Atención registrada"
                : "VidaSalud - Estado de atención actualizado";
    }

    private String cuerpo(String tipoEvento, Atencion atencion) {
        String paciente = atencion.getPacienteNombre() != null
                ? atencion.getPacienteNombre()
                : atencion.getPacienteId();
        return EVENTO_CREADA.equals(tipoEvento)
                ? "Hola " + paciente + ", tu atención #" + atencion.getId()
                        + " quedó registrada en estado " + atencion.getEstado() + "."
                : "Hola " + paciente + ", tu atención #" + atencion.getId()
                        + " cambió al estado " + atencion.getEstado() + ".";
    }
}
