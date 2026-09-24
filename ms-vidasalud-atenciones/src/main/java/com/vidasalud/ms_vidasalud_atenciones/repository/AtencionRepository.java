package com.vidasalud.ms_vidasalud_atenciones.repository;

import com.vidasalud.ms_vidasalud_atenciones.model.Atencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtencionRepository extends JpaRepository<Atencion, Long> {
    List<Atencion> findByPacienteId(String pacienteId);
    List<Atencion> findByEstado(String estado);
}