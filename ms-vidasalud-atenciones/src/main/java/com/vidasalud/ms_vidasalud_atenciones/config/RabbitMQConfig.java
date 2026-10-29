package com.vidasalud.ms_vidasalud_atenciones.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declaración de las colas de notificación.
 *
 * <p>Los argumentos (durable + dead-letter) deben coincidir exactamente con los
 * de ms-vidasalud-notify; si cambian, RabbitMQ responde
 * {@code PRECONDITION_FAILED} al declarar una cola ya existente.</p>
 */
@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_EMAIL = "q.cmd.email";
    public static final String DLQ_EMAIL = "q.cmd.email.dlq";

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(QUEUE_EMAIL)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ_EMAIL)
                .build();
    }

    @Bean
    public Queue emailDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_EMAIL).build();
    }

    /**
     * Fuerza a usar el tipo del parámetro del listener en vez de la cabecera
     * {@code __TypeId__} (que apunta a la clase de este microservicio y no
     * existe en el consumidor).
     */
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper mapper = new DefaultJackson2JavaTypeMapper();
        mapper.setTypePrecedence(DefaultJackson2JavaTypeMapper.TypePrecedence.INFERRED);
        converter.setJavaTypeMapper(mapper);
        return converter;
    }
}
