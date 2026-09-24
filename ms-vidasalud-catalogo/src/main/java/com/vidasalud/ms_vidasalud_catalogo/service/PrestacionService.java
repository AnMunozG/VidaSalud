package com.vidasalud.catalogo.service;

import com.vidasalud.catalogo.model.Prestacion;
import com.vidasalud.catalogo.repository.PrestacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrestacionService {

    @Autowired
    private PrestacionRepository repository;

    public List<Prestacion> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Prestacion> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Prestacion guardar(Prestacion prestacion) {
        return repository.save(prestacion);
    }

    public Optional<Prestacion> actualizar(Long id, Prestacion detalles) {
        return repository.findById(id).map(existente -> {
            existente.setNombre(detalles.getNombre());
            existente.setCodigoBox(detalles.getCodigoBox());
            existente.setCuposDisponibles(detalles.getCuposDisponibles());
            existente.setPrecio(detalles.getPrecio());
            return repository.save(existente);
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