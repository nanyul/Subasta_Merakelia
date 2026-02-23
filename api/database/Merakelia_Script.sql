-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS Merakelia;
USE Merakelia;

-- Tabla de roles de usuario
CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,
    activo BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES rol(id)
);

-- Tabla de estado de subastas
CREATE TABLE estado_subasta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de estado de cuadros
CREATE TABLE estado_cuadro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de estado de condición
CREATE TABLE estado_condicion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de categorías
CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

-- Tabla de imágenes
CREATE TABLE imagen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    datos VARCHAR(500),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuadros/subastables
CREATE TABLE cuadro_subastable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    nombre_artista VARCHAR(255),
    ano_creacion YEAR,
    tecnica VARCHAR(100),
    dimensiones VARCHAR(100),
    material_soporte VARCHAR(100),
    procedencia TEXT,
    certificado_autenticidad TINYINT,
    valor_estimado DECIMAL(12,2),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_estado_cuadro INT NOT NULL,
    id_estado_condicion INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_estado_cuadro) REFERENCES estado_cuadro(id),
    FOREIGN KEY (id_estado_condicion) REFERENCES estado_condicion(id),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

-- Relación de cuadros con imágenes
CREATE TABLE cuadro_imagen (
    id_cuadro INT NOT NULL,
    id_imagen INT NOT NULL,
    PRIMARY KEY (id_cuadro, id_imagen),
	FOREIGN KEY (id_cuadro) REFERENCES cuadro_subastable(id),
    FOREIGN KEY (id_imagen) REFERENCES imagen(id)
);

-- Cuadro_Categoria
CREATE TABLE cuadro_categoria (
    id_cuadro INT NOT NULL,
    id_categoria INT NOT NULL,
    PRIMARY KEY (id_cuadro, id_categoria),
	FOREIGN KEY (id_cuadro) REFERENCES cuadro_subastable(id),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);



-- Tabla de subastas
CREATE TABLE subasta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    precio_base DECIMAL(12,2) NOT NULL,
    incremento_minimo DECIMAL(8,2) NOT NULL,
    descripcion TEXT,
    es_publica TINYINT NOT NULL DEFAULT 1,
    id_estado_subasta INT NOT NULL,
    id_usuario INT NOT NULL,
    id_cuadro INT NOT NULL,
    FOREIGN KEY (id_estado_subasta) REFERENCES estado_subasta(id),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    FOREIGN KEY (id_cuadro) REFERENCES cuadro_subastable(id)
);

-- Tabla de pujas
CREATE TABLE puja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(12,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_subasta INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    FOREIGN KEY (id_subasta) REFERENCES subasta(id)
);

-- Tabla de resultados de subasta
CREATE TABLE resultado_subasta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_puja_ganadora INT NOT NULL,
    precio_final DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (id_puja_ganadora) REFERENCES puja(id)
);

-- Tabla de pagos
CREATE TABLE pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_subasta INT NOT NULL,
    esta_confirmado TINYINT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_subasta) REFERENCES subasta(id)
);

--- ============================
-- Carga de datos de catálogo
-- ============================
INSERT INTO rol (descripcion) VALUES
('comprador'), ('vendedor'), ('administrador');

INSERT INTO estado_subasta (descripcion) VALUES
('Activa'), ('Finalizada'), ('Cancelada');

INSERT INTO estado_cuadro (descripcion) VALUES
('Publicado'), ('Reservado'), ('Retirado');

INSERT INTO estado_condicion (descripcion) VALUES
('Nuevo'), ('Usado');

INSERT INTO categoria (descripcion) VALUES
('Paisaje'), ('Retrato'), ('Arte Moderno'), ('Naturaleza'), ('Abstracto');

-- ============================
-- Usuarios
-- ============================
INSERT INTO usuario (correo, contrasena, nombre, id_rol, activo) VALUES
('ana.comprador@email.com',   'passhash1', 'Ana López',       1, 1),
('bruno.vendedor@email.com',  'passhash2', 'Bruno Díaz',      2, 1),
('carla.admin@email.com',     'passhash3', 'Carla Méndez',    3, 1),
('dario.comprador@email.com', 'passhash4', 'Dario García',    1, 0),
('elena.vendedor@email.com',  'passhash5', 'Elena Torres',    2, 1);

-- ============================
-- Cuadros Subastables
-- ============================
INSERT INTO cuadro_subastable (
    nombre, descripcion, nombre_artista, ano_creacion, tecnica, dimensiones,
    material_soporte, procedencia, certificado_autenticidad,
    valor_estimado, id_estado_cuadro, id_estado_condicion, id_usuario
) VALUES
('Atardecer en la Montaña',
  'Acuarela original de paisajes inspiradores.',
  'Bruno Díaz', 2021, 'Acuarela', '40x50cm', 'Papel algodón', 'España',
  1, 300.00, 1, 1, 2),
('Retrato Azul',
  'Óleo sobre lienzo, excelente estado de conservación.',
  'Elena Torres', 2019, 'Óleo', '60x80cm', 'Lienzo', 'México',
  1, 800.00, 1, 2, 5),
('Bosque Encantado',
  'Pintura acrílica moderna. Certificado de autenticidad incluido.',
  'Bruno Díaz', 2023, 'Acrílico', '80x120cm', 'Madera', 'Italia',
  1, 1200.00, 1, 1, 2),
('Naturaleza Viva',
  'Lienzo usado, material resistente, técnica mixta.',
  'Elena Torres', 2018, 'Mixta', '50x70cm', 'Lienzo', 'Argentina',
  0, 400.00, 2, 2, 5);

-- ============================
-- Imágenes
-- ============================
INSERT INTO imagen (datos, fecha_registro) VALUES
('atardecer_EnLaMontaña.jpg',  '2026-02-22 13:59:00'),
('retrato_Azul.jpg',           '2026-02-22 14:01:00'),
('Bosque_Encantado.jpg',       '2026-02-22 14:02:00'),
('Naturaleza_Viva.jpg',        '2026-02-22 14:03:00');

-- Cuadro Imagen (asociación)
INSERT INTO cuadro_imagen (id_cuadro, id_imagen) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- Cuadro Categoría (asociación)
INSERT INTO cuadro_categoria (id_cuadro, id_categoria) VALUES
(1, 1),   -- Atardecer en la Montaña → Paisaje
(1, 4),   -- Atardecer en la Montaña → Naturaleza
(2, 2),   -- Retrato Azul → Retrato
(2, 5),   -- Retrato Azul → Abstracto
(3, 1),   -- Bosque Encantado → Paisaje
(3, 3),   -- Bosque Encantado → Arte Moderno
(3, 4),   -- Bosque Encantado → Naturaleza
(4, 4),   -- Naturaleza Viva → Naturaleza
(4, 3);   -- Naturaleza Viva → Arte Moderno

-- ============================
-- Subastas
-- ============================
INSERT INTO subasta 
(fecha_inicio, fecha_fin, precio_base, incremento_minimo, descripcion, es_publica, id_estado_subasta, id_usuario, id_cuadro) 
VALUES
('2026-02-20 10:00:00', '2026-03-05 22:00:00', 300.00, 25.00, 'Subasta abierta para la obra Atardecer en la Montaña. Acuarela original.', 1, 1, 2, 1),
('2026-02-18 08:00:00', '2026-03-01 20:00:00', 800.00, 50.00, 'Subasta pública del óleo Retrato Azul. Excelente conservación.', 1, 1, 5, 2),
('2026-01-10 09:00:00', '2026-02-10 21:00:00', 1200.00, 100.00, 'Subasta finalizada del acrílico Bosque Encantado.', 2, 2, 2, 3),
('2026-01-15 12:00:00', '2026-02-15 18:00:00', 400.00, 30.00,'Subasta cancelada de Naturaleza Viva por solicitud del vendedor.', 3, 3, 5, 4);

-- ============================
-- Pujas
-- ============================
INSERT INTO puja (monto, fecha_registro, id_usuario, id_subasta) VALUES
(325.00,  '2026-02-20 11:00:00', 1, 1),
(350.00,  '2026-02-20 14:30:00', 4, 1),
(375.00,  '2026-02-21 09:15:00', 1, 1),
(850.00,  '2026-02-18 10:00:00', 1, 2),
(900.00,  '2026-02-19 16:45:00', 4, 2),
(1300.00, '2026-01-12 10:00:00', 1, 3),
(1400.00, '2026-01-15 11:30:00', 4, 3),
(1500.00, '2026-01-20 17:00:00', 1, 3);

-- ============================
-- Resultado de Subasta
-- ============================
INSERT INTO resultado_subasta (id_puja_ganadora, precio_final) VALUES
(8, 1500.00);

-- ============================
-- Pagos
-- ============================
INSERT INTO pago (id_subasta, esta_confirmado, fecha_creacion, fecha_confirmacion) VALUES
(3, 1, '2026-02-11 10:00:00', '2026-02-12 15:30:00');