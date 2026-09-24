package com.vidasalud.bff.config;

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
                        .title("API BFF de VidaSalud")
                        .version("1.0.0")
                        .description("BFF (Backend for Frontend) que expone un punto único de entrada y reenvía las peticiones a los microservicios de catálogo y atenciones de VidaSalud."));
    }
}