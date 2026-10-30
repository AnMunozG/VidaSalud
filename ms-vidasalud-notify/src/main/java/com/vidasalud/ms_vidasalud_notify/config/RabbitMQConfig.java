package com.vidasalud.ms_vidasalud_notify.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Topología de notificaciones: 3 colas de flujo + sus 3 DLQ.
 *
 * <pre>
 * Cola              Propósito                                        DLQ                    Direct         Topic
 * q.cmd.email       Email/push al paciente                           q.cmd.email.dlq        email.send     email.*
 * q.cmd.admission   Ticket de admisión / llamado a box clínico       q.cmd.admission.dlq    admission.ticket admission.#
 * q.cmd.record      Generación de PDF (comprobante/resumen)          q.cmd.record.dlq       record.gen     record.*
 * </pre>
 *
 * <p>Las colas principales se enlazan a un exchange direct y a uno topic.
 * Las DLQ sólo existen en el exchange por defecto (se enrutan por nombre de
 * cola), por lo que un mensaje rechazado nunca vuelve al flujo original.</p>
 *
 * <p>Los argumentos (durable + dead-letter) deben coincidir exactamente con los
 * de ms-vidasalud-atenciones; si cambian, RabbitMQ responde
 * {@code PRECONDITION_FAILED} al declarar una cola ya existente.</p>
 */
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_DIRECT = "notify.direct";
    public static final String EXCHANGE_TOPIC = "notify.topic";

    public static final String QUEUE_EMAIL = "q.cmd.email";
    public static final String DLQ_EMAIL = "q.cmd.email.dlq";
    public static final String ROUTING_KEY_EMAIL_DIRECT = "email.send";
    public static final String ROUTING_KEY_EMAIL_TOPIC = "email.*";

    public static final String QUEUE_ADMISSION = "q.cmd.admission";
    public static final String DLQ_ADMISSION = "q.cmd.admission.dlq";
    public static final String ROUTING_KEY_ADMISSION_DIRECT = "admission.ticket";
    public static final String ROUTING_KEY_ADMISSION_TOPIC = "admission.#";

    public static final String QUEUE_RECORD = "q.cmd.record";
    public static final String DLQ_RECORD = "q.cmd.record.dlq";
    public static final String ROUTING_KEY_RECORD_DIRECT = "record.gen";
    public static final String ROUTING_KEY_RECORD_TOPIC = "record.*";

    @Bean
    public DirectExchange notifyDirectExchange() {
        return ExchangeBuilder.directExchange(EXCHANGE_DIRECT).durable(true).build();
    }

    @Bean
    public TopicExchange notifyTopicExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE_TOPIC).durable(true).build();
    }

    // ------------------------------------------------------------------
    // Flujo email
    // ------------------------------------------------------------------

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
    public Binding emailDirectBinding() {
        return BindingBuilder.bind(emailQueue()).to(notifyDirectExchange()).with(ROUTING_KEY_EMAIL_DIRECT);
    }

    @Bean
    public Binding emailTopicBinding() {
        return BindingBuilder.bind(emailQueue()).to(notifyTopicExchange()).with(ROUTING_KEY_EMAIL_TOPIC);
    }

    // ------------------------------------------------------------------
    // Flujo admission
    // ------------------------------------------------------------------

    @Bean
    public Queue admissionQueue() {
        return QueueBuilder.durable(QUEUE_ADMISSION)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ_ADMISSION)
                .build();
    }

    @Bean
    public Queue admissionDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_ADMISSION).build();
    }

    @Bean
    public Binding admissionDirectBinding() {
        return BindingBuilder.bind(admissionQueue()).to(notifyDirectExchange()).with(ROUTING_KEY_ADMISSION_DIRECT);
    }

    @Bean
    public Binding admissionTopicBinding() {
        return BindingBuilder.bind(admissionQueue()).to(notifyTopicExchange()).with(ROUTING_KEY_ADMISSION_TOPIC);
    }

    // ------------------------------------------------------------------
    // Flujo record
    // ------------------------------------------------------------------

    @Bean
    public Queue recordQueue() {
        return QueueBuilder.durable(QUEUE_RECORD)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ_RECORD)
                .build();
    }

    @Bean
    public Queue recordDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_RECORD).build();
    }

    @Bean
    public Binding recordDirectBinding() {
        return BindingBuilder.bind(recordQueue()).to(notifyDirectExchange()).with(ROUTING_KEY_RECORD_DIRECT);
    }

    @Bean
    public Binding recordTopicBinding() {
        return BindingBuilder.bind(recordQueue()).to(notifyTopicExchange()).with(ROUTING_KEY_RECORD_TOPIC);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
