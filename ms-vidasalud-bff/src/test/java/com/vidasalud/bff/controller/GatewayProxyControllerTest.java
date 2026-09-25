package com.vidasalud.bff.controller;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;

import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GatewayProxyControllerTest {

    private MockRestServiceServer server;
    private GatewayProxyController controller;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(response -> false);
        server = MockRestServiceServer.bindTo(restTemplate).build();
        controller = new GatewayProxyController(restTemplate, "http://localhost:8081", "http://localhost:8082");
    }

    @Test
    void reenviaGETDeCatalogoHaciaMicroservicio() {
        byte[] bodyEsperado = "[{\"id\":1,\"nombre\":\"Consulta Medicina General\"}]".getBytes(StandardCharsets.UTF_8);
        server.expect(once(), requestTo("http://localhost:8081/api/catalogo/prestaciones"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(bodyEsperado, MediaType.APPLICATION_JSON));

        ResponseEntity<byte[]> response = controller.catalogoLeer(new MockHttpServletRequest("GET", "/api/catalogo/prestaciones"));

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertArrayEquals(bodyEsperado, response.getBody());
        server.verify();
    }

    @Test
    void reenviaGETDeAtencionesConQueryParams() {
        byte[] bodyEsperado = "[{\"id\":3,\"estado\":\"EN_ESPERA\"}]".getBytes(StandardCharsets.UTF_8);
        server.expect(once(), requestTo("http://localhost:8082/api/atenciones?estado=EN_ESPERA"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(bodyEsperado, MediaType.APPLICATION_JSON));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/atenciones");
        request.setQueryString("estado=EN_ESPERA");

        ResponseEntity<byte[]> response = controller.atencionesLeer(request);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertArrayEquals(bodyEsperado, response.getBody());
        server.verify();
    }

    @Test
    void reenviaPOSTDeCatalogoConCuerpo() {
        byte[] bodyEnviado = "{\"nombre\":\"Consulta Dermatológica\"}".getBytes(StandardCharsets.UTF_8);
        byte[] bodyEsperado = "{\"id\":5,\"nombre\":\"Consulta Dermatológica\"}".getBytes(StandardCharsets.UTF_8);

        server.expect(once(), requestTo("http://localhost:8081/api/catalogo/prestaciones"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(bodyEsperado, MediaType.APPLICATION_JSON));

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/catalogo/prestaciones");

        ResponseEntity<byte[]> response = controller.catalogoEscribir(request, bodyEnviado);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertArrayEquals(bodyEsperado, response.getBody());
        server.verify();
    }

    @Test
    void propagaEstadoDeErrorDelMicroservicio() {
        server.expect(once(), requestTo("http://localhost:8082/api/atenciones/999"))
                .andExpect(method(HttpMethod.DELETE))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        ResponseEntity<byte[]> response = controller.atencionesEliminar(new MockHttpServletRequest("DELETE", "/api/atenciones/999"));

        Assertions.assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        server.verify();
    }
}