-- Seeds idempotentes de catálogo para MariaDB.
-- INSERT IGNORE: en el primer arranque se insertan; en arranques siguientes
-- (tabla ya poblada con los mismos ids) los duplicados se ignoran silenciosamente.
INSERT IGNORE INTO prestacion (id, nombre, codigo_box, cupos_disponibles, precio, categoria, duracion_min, requiere_box, activa)
VALUES (1, 'Consulta Medicina General', 'BOX-101', 15, 25000.00, 'medicina', 20, TRUE, TRUE);

INSERT IGNORE INTO prestacion (id, nombre, codigo_box, cupos_disponibles, precio, categoria, duracion_min, requiere_box, activa)
VALUES (2, 'Hemograma Completo', 'LAB-02', 30, 12500.00, 'laboratorio', 15, FALSE, TRUE);

INSERT IGNORE INTO prestacion (id, nombre, codigo_box, cupos_disponibles, precio, categoria, duracion_min, requiere_box, activa)
VALUES (3, 'Radiografía de Tórax', 'RX-01', 8, 35000.00, 'medicina', 20, TRUE, TRUE);

INSERT IGNORE INTO prestacion (id, nombre, codigo_box, cupos_disponibles, precio, categoria, duracion_min, requiere_box, activa)
VALUES (4, 'Atención Odontológica', 'BOX-204', 5, 40000.00, 'dental', 30, TRUE, TRUE);