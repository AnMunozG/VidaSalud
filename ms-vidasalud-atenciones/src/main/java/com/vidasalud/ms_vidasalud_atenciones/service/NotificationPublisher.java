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
 * Publica eventos de atenciones en la cola de notificaciones.
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

    public void publicar(String tipoEvento, Map<String, Object> payload) {
        try {
            EventEnvelope evento = new EventEnvelope(
                    UUID.randomUUID().toString(), tipoEvento, payload);
            rabbitTemplate.convertAndSend("", RabbitMQConfig.QUEUE_EMAIL, evento);
            log.info("Evento {} publicado en {}", tipoEvento, RabbitMQConfig.QUEUE_EMAIL);
        } catch (AmqpException e) {
            log.warn("No se pudo publicar el evento {} en {}: {}",
                    tipoEvento, RabbitMQConfig.QUEUE_EMAIL, e.getMessage());
        }
    }
}
