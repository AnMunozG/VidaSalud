package com.vidasalud.catalogo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Catálogo de Prestaciones - VidaSalud")
                        .version("1.0.0")
                        .description("Microservicio encargado de la gestión e información del catálogo de prestaciones médicas de VidaSalud."));
    }
}