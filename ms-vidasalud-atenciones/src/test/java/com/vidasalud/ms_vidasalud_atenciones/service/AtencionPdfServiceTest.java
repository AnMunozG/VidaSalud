package com.vidasalud.ms_vidasalud_atenciones.service;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AtencionPdfServiceTest {

    private final AtencionPdfService service = new AtencionPdfService();

    @Test
    void generaUnPdfConLosDatosDeLaAtencion() throws IOException {
        Atencion atencion = Atencion.builder()
                .id(42L)
                .pacienteId("pac-1")
                .pacienteNombre("María José Núñez")
                .pacienteEmail("maria@example.com")
                .prestacionId(7L)
                .fechaHora(LocalDateTime.of(2026, 10, 29, 9, 30))
                .estado("CONFIRMADA")
                .codigoBox("BOX-3")
                .centroId(1L)
                .build();

        byte[] pdf = service.generar(atencion);

        assertNotNull(pdf);
        assertTrue(pdf.length > 100, "El PDF debería tener contenido");
        assertEquals("%PDF-", new String(pdf, 0, 5, StandardCharsets.US_ASCII));
        try (PDDocument documento = PDDocument.load(pdf)) {
            assertEquals(1, documento.getNumberOfPages());
        }
    }

    @Test
    void generaUnPdfAunqueFaltenDatosOpcionales() throws IOException {
        Atencion atencion = Atencion.builder()
                .id(1L)
                .pacienteId("pac-1")
                .prestacionId(1L)
                .fechaHora(LocalDateTime.now())
                .estado("SOLICITADA")
                .build();

        byte[] pdf = service.generar(atencion);

        assertNotNull(pdf);
        assertTrue(pdf.length > 100, "El PDF debería tener contenido aunque falten campos");
        try (PDDocument documento = PDDocument.load(pdf)) {
            assertEquals(1, documento.getNumberOfPages());
        }
    }
}
