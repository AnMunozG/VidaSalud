CREATE TABLE IF NOT EXISTS atenciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id VARCHAR(255) NOT NULL,
    prestacion_id BIGINT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(255) NOT NULL,
    codigo_box VARCHAR(255),
    paciente_nombre VARCHAR(200),
    paciente_email VARCHAR(255),
    observaciones VARCHAR(1000),
    centro_id BIGINT
);