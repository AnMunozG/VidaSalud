package com.vidasalud.ms_vidasalud_notify.service;

import com.rabbitmq.client.Channel;
import com.vidasalud.ms_vidasalud_notify.config.RabbitMQConfig;
import com.vidasalud.ms_vidasalud_notify.dto.EventEnvelope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Consumidores de los tres flujos de notificación.
 *
 * <p>El acuse es manual: si el evento se procesa correctamente se hace
 * {@code basicAck}; si falla se hace {@code basicNack(requeue = false)} para
 * que RabbitMQ lo enrute a la DLQ correspondiente y no se reprocese en bucle.</p>
 */
@Service
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

    @RabbitListener(queues = RabbitMQConfig.QUEUE_EMAIL)
    public void receiveEmail(EventEnvelope event, Channel channel,
                             @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        procesar("email", RabbitMQConfig.QUEUE_EMAIL, event, channel, deliveryTag);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_ADMISSION)
    public void receiveAdmission(EventEnvelope event, Channel channel,
                                 @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        procesar("admission", RabbitMQConfig.QUEUE_ADMISSION, event, channel, deliveryTag);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_RECORD)
    public void receiveRecord(EventEnvelope event, Channel channel,
                              @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {
        procesar("record", RabbitMQConfig.QUEUE_RECORD, event, channel, deliveryTag);
    }

    private void procesar(String flujo, String cola, EventEnvelope event,
                          Channel channel, long deliveryTag) throws IOException {
        try {
            log.info("--- NUEVA NOTIFICACIÓN RECIBIDA ({}) ---", flujo);
            log.info("Cola: {}", cola);
            log.info("ID del Evento: {}", event.getEventId());
            log.info("Tipo: {}", event.getEventType());
            log.info("Contenido: {}", event.getPayload());
            log.info("------------------------------------");
        } catch (Exception e) {
            log.error("Error procesando el evento {} de {}: {}. Se envía a DLQ.",
                    event != null ? event.getEventId() : "desconocido", cola, e.getMessage(), e);
            channel.basicNack(deliveryTag, false, false);
            return;
        }

        channel.basicAck(deliveryTag, false);
        log.info("Evento {} de {} confirmado (ack)", event.getEventId(), cola);
    }
}
