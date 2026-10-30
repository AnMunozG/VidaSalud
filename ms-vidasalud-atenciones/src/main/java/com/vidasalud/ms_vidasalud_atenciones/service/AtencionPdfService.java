package com.vidasalud.ms_vidasalud_atenciones.service;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Genera el comprobante PDF de una atención.
 *
 * <p>El documento se construye en memoria (no se escribe en disco) y se
 * devuelve como {@code byte[]} para que el controller lo entregue directamente
 * al navegador. La fuente estándar Helvetica cubre los caracteres latinos
 * (tildes, ñ, etc.); cualquier carácter fuera de Latin-1 se reemplaza por
 * {@code ?} para evitar que PDFBox lance una excepción al escribir.</p>
 */
@Service
public class AtencionPdfService {

    private static final float MARGEN = 56f;
    private static final float ANCHO_PAGINA = PDRectangle.A4.getWidth();
    private static final float ETIQUETA_X = MARGEN;
    private static final float VALOR_X = MARGEN + 130f;
    private static final float ANCHO_VALOR = ANCHO_PAGINA - MARGEN - VALOR_X;
    private static final float TAMANO_TEXTO = 11f;

    private static final PDFont FUENTE = PDType1Font.HELVETICA;
    private static final PDFont FUENTE_NEGRITA = PDType1Font.HELVETICA_BOLD;

    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", new Locale("es", "CL"));

    /**
     * Genera el PDF con los datos de la atención.
     *
     * @throws UncheckedIOException si PDFBox no puede construir el documento.
     */
    public byte[] generar(Atencion atencion) {
        try (PDDocument documento = new PDDocument()) {
            PDPage pagina = new PDPage(PDRectangle.A4);
            documento.addPage(pagina);

            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                float y = 780f;

                y = centrar(contenido, FUENTE_NEGRITA, 22, y, "VidaSalud");
                y = centrar(contenido, FUENTE, 12, y - 4, "Comprobante de atención");
                y -= 14;
                linea(contenido, y);
                y -= 28;

                y = campo(contenido, y, "Atención N°", String.valueOf(atencion.getId()));
                y = campo(contenido, y, "Paciente", valorPrincipal(atencion.getPacienteNombre(), atencion.getPacienteId()));
                y = campo(contenido, y, "Email", atencion.getPacienteEmail());
                y = campo(contenido, y, "Prestación", String.valueOf(atencion.getPrestacionId()));
                y = campo(contenido, y, "Fecha y hora",
                        atencion.getFechaHora() != null ? atencion.getFechaHora().format(FORMATO_FECHA) : null);
                y = campo(contenido, y, "Estado", atencion.getEstado());
                y = campo(contenido, y, "Box", atencion.getCodigoBox());
                y = campo(contenido, y, "Centro",
                        atencion.getCentroId() != null ? atencion.getCentroId().toString() : null);

                y -= 12;
                linea(contenido, y);
                y -= 20;
                centrar(contenido, FUENTE, 9, y,
                        "Documento generado automáticamente por VidaSalud el "
                                + LocalDateTime.now().format(FORMATO_FECHA));
            }

            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            documento.save(salida);
            return salida.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(
                    "No se pudo generar el PDF de la atención " + atencion.getId(), e);
        }
    }

    /** Escribe una etiqueta en negrita y su valor, envolviendo el texto largo. */
    private float campo(PDPageContentStream contenido, float y, String etiqueta, String valor) throws IOException {
        escribir(contenido, FUENTE_NEGRITA, TAMANO_TEXTO, ETIQUETA_X, y, limpiar(etiqueta));

        List<String> lineas = envolver(limpiar(valor), FUENTE, TAMANO_TEXTO, ANCHO_VALOR);
        float actual = y;
        for (int i = 0; i < lineas.size(); i++) {
            if (i > 0) {
                actual -= TAMANO_TEXTO + 4;
            }
            escribir(contenido, FUENTE, TAMANO_TEXTO, VALOR_X, actual, lineas.get(i));
        }

        return actual - 20;
    }

    /** Escribe una línea centrada horizontalmente y devuelve la siguiente coordenada Y. */
    private float centrar(PDPageContentStream contenido, PDFont fuente, float tamano,
                          float y, String texto) throws IOException {
        String limpio = limpiar(texto);
        float ancho = ancho(fuente, tamano, limpio);
        escribir(contenido, fuente, tamano, (ANCHO_PAGINA - ancho) / 2f, y, limpio);
        return y - tamano - 4;
    }

    private void escribir(PDPageContentStream contenido, PDFont fuente, float tamano,
                          float x, float y, String texto) throws IOException {
        contenido.beginText();
        contenido.setFont(fuente, tamano);
        contenido.newLineAtOffset(x, y);
        contenido.showText(texto);
        contenido.endText();
    }

    private void linea(PDPageContentStream contenido, float y) throws IOException {
        contenido.setStrokingColor(180, 180, 180);
        contenido.setLineWidth(0.8f);
        contenido.moveTo(MARGEN, y);
        contenido.lineTo(ANCHO_PAGINA - MARGEN, y);
        contenido.stroke();
    }

    /** Divide el texto en líneas que caben dentro del ancho indicado. */
    private List<String> envolver(String texto, PDFont fuente, float tamano, float anchoMax) throws IOException {
        List<String> lineas = new ArrayList<>();
        for (String parrafo : texto.split("\\R")) {
            StringBuilder actual = new StringBuilder();
            for (String palabra : parrafo.trim().split("\\s+")) {
                if (palabra.isEmpty()) {
                    continue;
                }
                String candidata = actual.length() == 0 ? palabra : actual + " " + palabra;
                if (actual.length() > 0 && ancho(fuente, tamano, candidata) > anchoMax) {
                    lineas.add(actual.toString());
                    actual = new StringBuilder(palabra);
                } else {
                    actual.setLength(0);
                    actual.append(candidata);
                }
            }
            lineas.add(actual.toString());
        }
        return lineas;
    }

    private float ancho(PDFont fuente, float tamano, String texto) throws IOException {
        return fuente.getStringWidth(texto) / 1000f * tamano;
    }

    private String valorPrincipal(String principal, String alternativo) {
        if (principal != null && !principal.isBlank()) {
            return principal;
        }
        return alternativo;
    }

    /** Normaliza nulos y caracteres no representables con la fuente estándar. */
    private String limpiar(String texto) {
        if (texto == null || texto.isBlank()) {
            return "-";
        }
        return texto
                .replaceAll("[\\r\\n\\t]", " ")
                .replaceAll("[^\\x00-\\xFF]", "?");
    }
}
