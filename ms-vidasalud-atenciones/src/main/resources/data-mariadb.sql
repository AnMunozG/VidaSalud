-- Seeds idempotentes de atenciones para MariaDB.
-- La tabla la crea schema.sql (CREATE TABLE IF NOT EXISTS), así que en cada
-- arranque estos INSERT IGNORE solo agregan filas si no existen los mismos ids.
INSERT IGNORE INTO atenciones (id, paciente_id, prestacion_id, fecha_hora, estado, codigo_box, paciente_nombre, paciente_email, observaciones, centro_id)
VALUES (1, '12345678-9', 1, '2026-09-23 09:00:00', 'SOLICITADA', 'BOX-101', NULL, NULL, NULL, NULL);

INSERT IGNORE INTO atenciones (id, paciente_id, prestacion_id, fecha_hora, estado, codigo_box, paciente_nombre, paciente_email, observaciones, centro_id)
VALUES (2, '98765432-1', 2, '2026-09-23 10:30:00', 'CONFIRMADA', 'BOX-102', NULL, NULL, NULL, NULL);

INSERT IGNORE INTO atenciones (id, paciente_id, prestacion_id, fecha_hora, estado, codigo_box, paciente_nombre, paciente_email, observaciones, centro_id)
VALUES (3, '11223344-5', 1, '2026-09-23 11:15:00', 'EN_ESPERA', 'BOX-101', NULL, NULL, NULL, NULL);

INSERT IGNORE INTO atenciones (id, paciente_id, prestacion_id, fecha_hora, estado, codigo_box, paciente_nombre, paciente_email, observaciones, centro_id)
VALUES (4, '15555666-7', 3, '2026-09-23 12:00:00', 'EN_ATENCION', 'BOX-205', NULL, NULL, NULL, NULL);

INSERT IGNORE INTO atenciones (id, paciente_id, prestacion_id, fecha_hora, estado, codigo_box, paciente_nombre, paciente_email, observaciones, centro_id)
VALUES (5, '18888999-0', 2, '2026-09-22 16:00:00', 'CERRADA', 'BOX-103', NULL, NULL, NULL, NULL);

INSERT IGNORE INTO atenciones (id, paciente_id, prestacion_id, fecha_hora, estado, codigo_box, paciente_nombre, paciente_email, observaciones, centro_id)
VALUES (6, '20111222-3', 4, '2026-09-23 14:00:00', 'CANCELADA', NULL, NULL, NULL, NULL, NULL);