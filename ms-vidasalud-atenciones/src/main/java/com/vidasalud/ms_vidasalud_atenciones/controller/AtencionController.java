package com.vidasalud.ms_vidasalud_atenciones.controller;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import com.vidasalud.ms_vidasalud_atenciones.service.AtencionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/atenciones")
@RequiredArgsConstructor
public class AtencionController {

    private final AtencionService service;

    @GetMapping
    public List<Atencion> obtenerTodas(@RequestParam(required = false) String estado) {
        if (estado != null) {
            return service.obtenerPorEstado(estado);
        }
        return service.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Atencion> obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Atencion> crear(@RequestBody Atencion atencion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(atencion));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Atencion> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null) {
            return ResponseEntity.badRequest().build();
        }
        return service.cambiarEstado(id, nuevoEstado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Genera y descarga el comprobante PDF de la atención. Además publica el
     * evento {@code ATENCION_IMPRESA} en el flujo {@code record} de RabbitMQ.
     */
    @PostMapping("/{id}/imprimir")
    public ResponseEntity<byte[]> solicitarImpresion(@PathVariable Long id) {
        return service.generarPdf(id)
                .map(pdf -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"atencion-" + id + ".pdf\"")
                        .body(pdf))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (service.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}