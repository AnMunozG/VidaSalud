package com.vidasalud.bff.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GatewayProxyControllerAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    private static JwtAuthenticationToken usuarioConRol(String rol) {
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .claim("roles", List.of(rol))
                .subject("usuario-test")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
        return new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
    }

    @Test
    void pacienteNoPuedeEscribirEnCatalogo() throws Exception {
        mockMvc.perform(post("/api/catalogo/prestaciones")
                        .with(authentication(usuarioConRol("PACIENTE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void pacientePuedeLeerCatalogo() throws Exception {
        mockMvc.perform(get("/api/catalogo/prestaciones")
                        .with(authentication(usuarioConRol("PACIENTE"))))
                .andExpect(status().isBadGateway());
    }

    @Test
    void soloAdminPuedeEliminarAtenciones() throws Exception {
        mockMvc.perform(delete("/api/atenciones/999")
                        .with(authentication(usuarioConRol("RECEPCIONISTA"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/atenciones/999")
                        .with(authentication(usuarioConRol("ADMIN"))))
                .andExpect(status().isBadGateway());
    }
}