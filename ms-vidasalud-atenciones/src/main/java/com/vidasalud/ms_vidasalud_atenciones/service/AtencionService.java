package com.vidasalud.ms_vidasalud_atenciones.service;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import com.vidasalud.ms_vidasalud_atenciones.repository.AtencionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Reglas de negocio del módulo de atenciones.
 *
 * <p>Se eliminó la "Regla de Negocio" que descontaba cupo en ms-vidasalud-catalogo
 * al confirmar una atención: apuntaba a una URL inexistente
 * ({@code /api/catalog/services/{id}/descontar-cupo}) y a {@code localhost:8081},
 * que dentro de Docker apunta al propio contenedor. Hasta que el catálogo exponga
 * ese endpoint, la transición de estado solo persiste el nuevo estado.</p>
 */
@Service
@RequiredArgsConstructor
public class AtencionService {

    private final AtencionRepository repository;

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
            atencion.setEstado(nuevoEstado);
            return repository.save(atencion);
        });
    }

    public boolean eliminar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}