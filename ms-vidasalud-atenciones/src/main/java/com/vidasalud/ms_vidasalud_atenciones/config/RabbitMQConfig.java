package com.vidasalud.ms_vidasalud_atenciones.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declaración de la infraestructura de notificaciones del lado productor.
 *
 * <p>Se declaran los exchanges, las 3 colas de flujo, sus 3 DLQ y los bindings
 * para que este servicio pueda publicar aunque ms-vidasalud-notify todavía no
 * haya arrancado (en un broker limpio el exchange y la cola deben existir antes
 * del publish).</p>
 *
 * <p>Los nombres y argumentos (durable + dead-letter) deben coincidir
 * exactamente con los de ms-vidasalud-notify; si cambian, RabbitMQ responde
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
    // Flujo email (modificación de una atención)
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
    // Flujo admission (creación de una atención)
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
    // Flujo record (impresión / generación de PDF)
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
