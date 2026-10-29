package com.vidasalud.ms_vidasalud_notify.service;

import com.vidasalud.ms_vidasalud_notify.config.RabbitMQConfig;
import com.vidasalud.ms_vidasalud_notify.dto.EventEnvelope;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_EMAIL)
    public void receiveMessage(EventEnvelope event) {
        System.out.println("--- NUEVA NOTIFICACIÓN RECIBIDA ---");
        System.out.println("ID del Evento: " + event.getEventId());
        System.out.println("Tipo: " + event.getEventType());
        System.out.println("Contenido: " + event.getPayload());
        System.out.println("------------------------------------");
    }
}