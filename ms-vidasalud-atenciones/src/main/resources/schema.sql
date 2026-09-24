DROP TABLE IF EXISTS atenciones;

CREATE TABLE atenciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id VARCHAR(255) NOT NULL,
    prestacion_id BIGINT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(255) NOT NULL,
    codigo_box VARCHAR(255)
);