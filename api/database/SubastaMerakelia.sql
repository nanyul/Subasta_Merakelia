-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: merakelia
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Paisaje'),(2,'Retrato'),(3,'Arte Moderno'),(4,'Naturaleza'),(5,'Abstracto'),(6,'Realismo'),(7,'Impresionismo'),(8,'Cubismo'),(9,'Surrealismo'),(10,'Pop Art');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuadro_categoria`
--

DROP TABLE IF EXISTS `cuadro_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuadro_categoria` (
  `id_cuadro` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  PRIMARY KEY (`id_cuadro`,`id_categoria`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `cuadro_categoria_ibfk_1` FOREIGN KEY (`id_cuadro`) REFERENCES `cuadro_subastable` (`id`),
  CONSTRAINT `cuadro_categoria_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuadro_categoria`
--

LOCK TABLES `cuadro_categoria` WRITE;
/*!40000 ALTER TABLE `cuadro_categoria` DISABLE KEYS */;
INSERT INTO `cuadro_categoria` VALUES (1,1),(1,4),(2,2),(2,5),(3,1),(3,3),(3,4),(4,3),(4,4),(5,1),(5,4),(5,6),(6,2),(6,3),(6,7),(7,4),(7,5),(7,8),(8,3),(8,5),(8,9),(9,1),(9,4),(9,10);
/*!40000 ALTER TABLE `cuadro_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuadro_imagen`
--

DROP TABLE IF EXISTS `cuadro_imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuadro_imagen` (
  `id_cuadro` int(11) NOT NULL,
  `id_imagen` int(11) NOT NULL,
  PRIMARY KEY (`id_cuadro`,`id_imagen`),
  KEY `id_imagen` (`id_imagen`),
  CONSTRAINT `cuadro_imagen_ibfk_1` FOREIGN KEY (`id_cuadro`) REFERENCES `cuadro_subastable` (`id`),
  CONSTRAINT `cuadro_imagen_ibfk_2` FOREIGN KEY (`id_imagen`) REFERENCES `imagen` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuadro_imagen`
--

LOCK TABLES `cuadro_imagen` WRITE;
/*!40000 ALTER TABLE `cuadro_imagen` DISABLE KEYS */;
INSERT INTO `cuadro_imagen` VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(7,12),(8,8),(8,10),(9,9),(9,11);
/*!40000 ALTER TABLE `cuadro_imagen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuadro_subastable`
--

DROP TABLE IF EXISTS `cuadro_subastable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuadro_subastable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nombre_artista` varchar(255) DEFAULT NULL,
  `ano_creacion` year(4) DEFAULT NULL,
  `tecnica` varchar(100) DEFAULT NULL,
  `dimensiones` varchar(100) DEFAULT NULL,
  `material_soporte` varchar(100) DEFAULT NULL,
  `procedencia` text DEFAULT NULL,
  `certificado_autenticidad` tinyint(4) DEFAULT NULL,
  `valor_estimado` decimal(12,2) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_estado_cuadro` int(11) NOT NULL,
  `id_estado_condicion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_estado_cuadro` (`id_estado_cuadro`),
  KEY `id_estado_condicion` (`id_estado_condicion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `cuadro_subastable_ibfk_1` FOREIGN KEY (`id_estado_cuadro`) REFERENCES `estado_cuadro` (`id`),
  CONSTRAINT `cuadro_subastable_ibfk_2` FOREIGN KEY (`id_estado_condicion`) REFERENCES `estado_condicion` (`id`),
  CONSTRAINT `cuadro_subastable_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuadro_subastable`
--

LOCK TABLES `cuadro_subastable` WRITE;
/*!40000 ALTER TABLE `cuadro_subastable` DISABLE KEYS */;
INSERT INTO `cuadro_subastable` VALUES (1,'Atardecer en la Montaña','Acuarela original de paisajes inspiradores.','Bruno Díaz',2021,'Acuarela','40x50cm','Papel algodón','España',1,300.00,'2026-02-23 17:56:42',1,1,2),(2,'Retrato Azul','Óleo sobre lienzo, excelente estado de conservación.','Elena Torres',2019,'Óleo','60x80cm','Lienzo','México',1,800.00,'2026-02-23 17:56:42',1,2,5),(3,'Bosque Encantado','Pintura acrílica moderna. Certificado de autenticidad incluido.','Bruno Díaz',2023,'Acrílico','80x120cm','Madera','Italia',1,1200.00,'2026-02-23 17:56:42',1,1,2),(4,'Naturaleza Viva','Lienzo usado, material resistente, técnica mixta.','Elena Torres',2018,'Mixta','50x70cm','Lienzo','Argentina',0,400.00,'2026-02-23 17:56:42',2,2,5),(5,'Mar en Calma','Acrílico sobre lienzo, tonos azulados, ideal para sala moderna.','Gabriela Mora',2020,'Acrílico','45x60cm','Lienzo','Chile',1,750.00,'2026-03-09 00:41:04',1,1,6),(6,'Rostros Urbanos','Obra contemporánea, técnica mixta, inspirada en grandes urbes.','Julio Paredes',2022,'Mixta','70x70cm','Madera','Colombia',0,900.00,'2026-03-09 00:41:04',1,2,10),(7,'Flores del Desierto','Colorida composición de flores silvestres, excelente acabado.','Gabriela Mora',2023,'Óleo','55x80cm','Lienzo','Perú',1,1100.00,'2026-03-09 00:41:04',2,1,6),(8,'Sombras Abstractas','Minimalista, juego de luces y sombras en formato cuadrado.','Julio Paredes',2019,'Acrílico','60x60cm','Lienzo','Uruguay',0,600.00,'2026-03-09 00:41:04',3,2,10),(9,'Montañas Doradas','Paisaje montañoso dorado, dorados sobre acrílico.','Gabriela Mora',2021,'Acrílico','50x120cm','Lienzo','Bolivia',1,2000.00,'2026-03-09 00:41:04',1,1,6);
/*!40000 ALTER TABLE `cuadro_subastable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_condicion`
--

DROP TABLE IF EXISTS `estado_condicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_condicion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_condicion`
--

LOCK TABLES `estado_condicion` WRITE;
/*!40000 ALTER TABLE `estado_condicion` DISABLE KEYS */;
INSERT INTO `estado_condicion` VALUES (1,'Nuevo'),(2,'Usado');
/*!40000 ALTER TABLE `estado_condicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_cuadro`
--

DROP TABLE IF EXISTS `estado_cuadro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_cuadro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_cuadro`
--

LOCK TABLES `estado_cuadro` WRITE;
/*!40000 ALTER TABLE `estado_cuadro` DISABLE KEYS */;
INSERT INTO `estado_cuadro` VALUES (1,'Publicado'),(2,'Reservado'),(3,'Retirado');
/*!40000 ALTER TABLE `estado_cuadro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_subasta`
--

DROP TABLE IF EXISTS `estado_subasta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_subasta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_subasta`
--

LOCK TABLES `estado_subasta` WRITE;
/*!40000 ALTER TABLE `estado_subasta` DISABLE KEYS */;
INSERT INTO `estado_subasta` VALUES (1,'Activa'),(3,'Cancelada'),(2,'Finalizada');
/*!40000 ALTER TABLE `estado_subasta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagen`
--

DROP TABLE IF EXISTS `imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `datos` varchar(500) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagen`
--

LOCK TABLES `imagen` WRITE;
/*!40000 ALTER TABLE `imagen` DISABLE KEYS */;
INSERT INTO `imagen` VALUES (1,'atardecer_EnLaMontaña.jpg','2026-02-22 19:59:00'),(2,'retrato_Azul.jpg','2026-02-22 20:01:00'),(3,'Bosque_Encantado.jpg','2026-02-22 20:02:00'),(4,'Naturaleza_Viva.jpg','2026-02-22 20:03:00'),(5,'mar_en_calma.jpg','2026-03-09 00:40:06'),(6,'rostros_urbanos.jpg','2026-03-09 00:40:06'),(7,'flores_desierto.jpg','2026-03-09 00:40:06'),(8,'sombras_abstractas.jpg','2026-03-09 00:40:06'),(9,'montanas_doradas.jpg','2026-03-09 00:40:06'),(10,'sombras_abstractas2.png','2026-03-09 03:02:11'),(11,'montanas_doradas2.jpg','2026-03-09 03:02:11'),(12,'flores_desierto2.png','2026-03-09 03:02:11');
/*!40000 ALTER TABLE `imagen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_subasta` int(11) NOT NULL,
  `esta_confirmado` tinyint(4) NOT NULL DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_subasta` (`id_subasta`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_subasta`) REFERENCES `subasta` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,3,1,'2026-02-11 16:00:00','2026-02-12 21:30:00');
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puja`
--

DROP TABLE IF EXISTS `puja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puja` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `monto` decimal(12,2) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `id_subasta` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_subasta` (`id_subasta`),
  CONSTRAINT `puja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `puja_ibfk_2` FOREIGN KEY (`id_subasta`) REFERENCES `subasta` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puja`
--

LOCK TABLES `puja` WRITE;
/*!40000 ALTER TABLE `puja` DISABLE KEYS */;
INSERT INTO `puja` VALUES (1,325.00,'2026-02-20 17:00:00',1,1),(2,350.00,'2026-02-20 20:30:00',4,1),(3,375.00,'2026-02-21 15:15:00',1,1),(4,850.00,'2026-02-18 16:00:00',1,2),(5,900.00,'2026-02-19 22:45:00',4,2),(6,1300.00,'2026-01-12 16:00:00',1,3),(7,1400.00,'2026-01-15 17:30:00',4,3),(8,1500.00,'2026-01-20 23:00:00',1,3);
/*!40000 ALTER TABLE `puja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultado_subasta`
--

DROP TABLE IF EXISTS `resultado_subasta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultado_subasta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_puja_ganadora` int(11) NOT NULL,
  `precio_final` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_puja_ganadora` (`id_puja_ganadora`),
  CONSTRAINT `resultado_subasta_ibfk_1` FOREIGN KEY (`id_puja_ganadora`) REFERENCES `puja` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultado_subasta`
--

LOCK TABLES `resultado_subasta` WRITE;
/*!40000 ALTER TABLE `resultado_subasta` DISABLE KEYS */;
INSERT INTO `resultado_subasta` VALUES (1,8,1500.00);
/*!40000 ALTER TABLE `resultado_subasta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (3,'administrador'),(1,'comprador'),(2,'vendedor');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subasta`
--

DROP TABLE IF EXISTS `subasta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subasta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `precio_base` decimal(12,2) NOT NULL,
  `incremento_minimo` decimal(8,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `es_publica` tinyint(4) NOT NULL DEFAULT 1,
  `id_estado_subasta` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cuadro` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_estado_subasta` (`id_estado_subasta`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_cuadro` (`id_cuadro`),
  CONSTRAINT `subasta_ibfk_1` FOREIGN KEY (`id_estado_subasta`) REFERENCES `estado_subasta` (`id`),
  CONSTRAINT `subasta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `subasta_ibfk_3` FOREIGN KEY (`id_cuadro`) REFERENCES `cuadro_subastable` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subasta`
--

LOCK TABLES `subasta` WRITE;
/*!40000 ALTER TABLE `subasta` DISABLE KEYS */;
INSERT INTO `subasta` VALUES (1,'2026-02-20 10:00:00','2026-03-05 22:00:00',300.00,25.00,'Subasta abierta para la obra Atardecer en la Montaña. Acuarela original.',1,1,2,1),(2,'2026-02-18 08:00:00','2026-03-01 20:00:00',800.00,50.00,'Subasta pública del óleo Retrato Azul. Excelente conservación.',1,1,5,2),(3,'2026-01-10 09:00:00','2026-02-10 21:00:00',1200.00,100.00,'Subasta finalizada del acrílico Bosque Encantado.',2,2,2,3),(4,'2026-01-15 12:00:00','2026-02-15 18:00:00',400.00,30.00,'Subasta cancelada de Naturaleza Viva por solicitud del vendedor.',3,3,5,4),(5,'2026-03-10 09:00:00','2026-03-20 21:00:00',750.00,30.00,'Subasta activa: obra “Mar en Calma” por Gabriela Mora.',1,1,6,5),(6,'2026-03-11 10:30:00','2026-03-22 22:30:00',900.00,40.00,'Subasta pública: “Rostros Urbanos” de Julio Paredes.',1,1,10,6),(7,'2026-02-01 08:00:00','2026-02-15 20:30:00',1100.00,50.00,'Subasta finalizada: “Flores del Desierto” de Gabriela Mora.',1,2,6,7),(8,'2026-01-20 14:00:00','2026-02-05 16:00:00',600.00,20.00,'Subasta cancelada de la obra “Sombras Abstractas”, motivo administrativo.',1,3,10,8),(9,'2026-03-12 10:00:00','2026-03-25 21:30:00',2000.00,100.00,'Obra premium “Montañas Doradas”, subasta abierta de Gabriela Mora.',1,1,6,9);
/*!40000 ALTER TABLE `subasta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_rol` int(11) NOT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'ana.comprador@email.com','passhash1','Ana López','2026-02-23 17:56:42',1,_binary ''),(2,'bruno.vendedor@email.com','passhash2','Bruno Díaz','2026-02-23 17:56:42',2,_binary ''),(3,'carla.admin@email.com','passhash3','Carla Méndez','2026-02-23 17:56:42',3,_binary ''),(4,'dario.comprador@email.com','passhash4','Dario García','2026-02-23 17:56:42',1,_binary '\0'),(5,'elena.vendedor@email.com','passhash5','Elena Torres','2026-02-23 17:56:42',2,_binary ''),(6,'franco.comprador@email.com','passhash6','Franco Ruiz','2026-03-09 00:15:15',1,_binary ''),(7,'gabriela.vendedor@email.com','passhash7','Gabriela Mora','2026-03-09 00:15:15',2,_binary ''),(8,'hector.admin@email.com','passhash8','Héctor Benítez','2026-03-09 00:15:15',3,_binary ''),(9,'ines.comprador@email.com','passhash9','Inés Rodríguez','2026-03-09 00:15:15',1,_binary '\0'),(10,'julio.vendedor@email.com','passhash10','Julio Paredes','2026-03-09 00:15:15',2,_binary '');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-08 22:44:28
