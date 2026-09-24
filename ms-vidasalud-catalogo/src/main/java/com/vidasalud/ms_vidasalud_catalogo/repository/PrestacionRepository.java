package com.vidasalud.catalogo.repository;

import com.vidasalud.catalogo.model.Prestacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestacionRepository extends JpaRepository<Prestacion, Long> {
}