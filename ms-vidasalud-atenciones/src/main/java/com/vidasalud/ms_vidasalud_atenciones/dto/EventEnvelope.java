package com.vidasalud.ms_vidasalud_atenciones.dto;

import java.io.Serializable;
import java.util.Map;

/**
 * Sobre del evento que se publica en RabbitMQ.
 *
 * <p>Debe mantener exactamente los mismos campos que el {@code EventEnvelope}
 * de ms-vidasalud-notify para que el consumidor lo deserialice sin problemas.</p>
 */
public class EventEnvelope implements Serializable {
    private String eventId;
    private String eventType;
    private Map<String, Object> payload;

    public EventEnvelope() {}

    public EventEnvelope(String eventId, String eventType, Map<String, Object> payload) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.payload = payload;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }
}
