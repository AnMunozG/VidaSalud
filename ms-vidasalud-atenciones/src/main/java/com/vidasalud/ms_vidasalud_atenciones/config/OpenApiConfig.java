package com.vidasalud.ms_vidasalud_atenciones.config;

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
                        .title("API de Atenciones - VidaSalud")
                        .version("1.0.0")
                        .description("Microservicio encargado de gestionar el flujo y ciclo de vida de las atenciones médicas."));
    }
}