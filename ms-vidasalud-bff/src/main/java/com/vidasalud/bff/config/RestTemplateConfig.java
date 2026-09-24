package com.vidasalud.bff.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente HTTP que el BFF usa para reenviar las peticiones a los microservicios.
 *
 * <p>El {@code ResponseErrorHandler} configurado (que siempre dice "no hay
 * error") es intencional: el proxy debe devolver al frontend el estado y el
 * cuerpo originales del microservicio
 * (incluidos los 4xx/5xx) sin que RestTemplate lance excepciones. Solo los
 * problemas de conectividad (servicio caído) se convierten en 502 en el
 * {@link com.vidasalud.bff.controller.GatewayProxyController}.</p>
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(response -> false);
        return restTemplate;
    }
}