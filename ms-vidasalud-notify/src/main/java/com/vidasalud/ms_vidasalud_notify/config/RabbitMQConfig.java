package com.vidasalud.ms_vidasalud_notify.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}