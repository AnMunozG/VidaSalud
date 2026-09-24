package com.vidasalud.catalogo.controller;

import com.vidasalud.catalogo.model.Prestacion;
import com.vidasalud.catalogo.service.PrestacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo/prestaciones")
public class PrestacionController {

    @Autowired
    private PrestacionService service;

    @GetMapping
    public List<Prestacion> obtenerTodas() {
        return service.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestacion> obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Prestacion> crear(@RequestBody Prestacion prestacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(prestacion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prestacion> actualizar(@PathVariable Long id, @RequestBody Prestacion prestacion) {
        return service.actualizar(id, prestacion)
                .map(ResponseEntity::ok)
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