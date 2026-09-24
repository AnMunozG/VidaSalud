package com.vidasalud.catalogo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prestacion")
@Data
public class Prestacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;           // Ej: Consulta Médica
    private String codigoBox;        // Ej: BOX-101
    private Integer cuposDisponibles; // Ej: 10
    private Double precio;           // Ej: 25000
    private String categoria;        // medicina, dental, pediatría, enfermería, laboratorio
    private Integer duracionMin;     // duración en minutos
    private Boolean requiereBox;     // true si necesita un box clínico
    private Boolean activa;          // true si está disponible en el catálogo
}