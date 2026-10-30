package com.vidasalud.ms_vidasalud_atenciones.service;

import com.vidasalud.ms_vidasalud_atenciones.config.RabbitMQConfig;
import com.vidasalud.ms_vidasalud_atenciones.dto.EventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Publica eventos de atenciones en el exchange de notificaciones.
 *
 * <p>Se publica al exchange (nunca directo a la cola) para que las reglas de
 * binding definidas en ms-vidasalud-notify decidan el destino:</p>
 * <ul>
 *   <li>Creación de atención -&gt; {@code admission.ticket} (ticket de admisión).</li>
 *   <li>Modificación de estado -&gt; {@code email.send} (email/push al paciente).</li>
 *   <li>Impresión -&gt; {@code record.gen} (generación del PDF).</li>
 * </ul>
 *
 * <p>Si RabbitMQ no está disponible, el error se registra y se descarta: la
 * operación de negocio (crear/cambiar estado) ya quedó persistida y no debe
 * fallar por un problema de mensajería.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publicarAdmision(String tipoEvento, Map<String, Object> payload) {
        publicar(RabbitMQConfig.ROUTING_KEY_ADMISSION_DIRECT, tipoEvento, payload);
    }

    public void publicarEmail(String tipoEvento, Map<String, Object> payload) {
        publicar(RabbitMQConfig.ROUTING_KEY_EMAIL_DIRECT, tipoEvento, payload);
    }

    public void publicarRecord(String tipoEvento, Map<String, Object> payload) {
        publicar(RabbitMQConfig.ROUTING_KEY_RECORD_DIRECT, tipoEvento, payload);
    }

    private void publicar(String routingKey, String tipoEvento, Map<String, Object> payload) {
        try {
            EventEnvelope evento = new EventEnvelope(
                    UUID.randomUUID().toString(), tipoEvento, payload);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_DIRECT,
                    routingKey,
                    evento);
            log.info("Evento {} publicado en {} con routing key {}",
                    tipoEvento, RabbitMQConfig.EXCHANGE_DIRECT, routingKey);
        } catch (AmqpException e) {
            log.warn("No se pudo publicar el evento {} en {} con routing key {}: {}",
                    tipoEvento, RabbitMQConfig.EXCHANGE_DIRECT, routingKey, e.getMessage());
        }
    }
}
