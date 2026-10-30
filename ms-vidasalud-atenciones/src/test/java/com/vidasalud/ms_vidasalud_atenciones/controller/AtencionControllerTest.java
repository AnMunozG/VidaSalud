package com.vidasalud.ms_vidasalud_atenciones.controller;

import com.vidasalud.ms_vidasalud_atenciones.service.AtencionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AtencionController.class)
@AutoConfigureMockMvc(addFilters = false)
class AtencionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AtencionService service;

    @Test
    void descargaElPdfConNombreDeArchivoYContentType() throws Exception {
        byte[] pdf = "%PDF-1.4 contenido".getBytes();
        when(service.generarPdf(7L)).thenReturn(Optional.of(pdf));

        mockMvc.perform(post("/api/atenciones/7/imprimir"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"atencion-7.pdf\""))
                .andExpect(content().bytes(pdf));
    }

    @Test
    void devuelve404CuandoLaAtencionNoExiste() throws Exception {
        when(service.generarPdf(99L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/atenciones/99/imprimir"))
                .andExpect(status().isNotFound());
    }
}
