package com.vidasalud.ms_vidasalud_atenciones.service;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import com.vidasalud.ms_vidasalud_atenciones.repository.AtencionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AtencionService {

    private final AtencionRepository repository;
    private final RestTemplate restTemplate;

    private static final String CATALOG_SERVICE_URL = "http://localhost:8081/api/catalog/services/";

    public List<Atencion> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Atencion> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public List<Atencion> obtenerPorEstado(String estado) {
        return repository.findByEstado(estado);
    }

    public Atencion crear(Atencion atencion) {
        if (atencion.getEstado() == null) {
            atencion.setEstado("SOLICITADA");
        }
        return repository.save(atencion);
    }

    public Optional<Atencion> cambiarEstado(Long id, String nuevoEstado) {
        return repository.findById(id).map(atencion -> {
            // Regla de Negocio: Si pasa a CONFIRMADA, notifica al catálogo para reducir cupo
            if ("CONFIRMADA".equalsIgnoreCase(nuevoEstado) && !"CONFIRMADA".equalsIgnoreCase(atencion.getEstado())) {
                descontarCupoEnCatalogo(atencion.getPrestacionId());
            }
            atencion.setEstado(nuevoEstado);
            return repository.save(atencion);
        });
    }

    private void descontarCupoEnCatalogo(Long prestacionId) {
        try {
            restTemplate.put(CATALOG_SERVICE_URL + prestacionId + "/descontar-cupo", null);
        } catch (Exception e) {
            System.err.println("Advertencia: No se pudo contactar ms-vidasalud-catalog en el puerto 8081. " + e.getMessage());
        }
    }

    public boolean eliminar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}