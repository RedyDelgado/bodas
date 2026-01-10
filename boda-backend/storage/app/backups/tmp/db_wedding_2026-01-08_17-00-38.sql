/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: mysql    Database: db_wedding
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `ajustes_marca`
--

DROP TABLE IF EXISTS `ajustes_marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ajustes_marca` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre_plataforma` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_principal` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#2C3E50',
  `color_secundario` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#E67E22',
  `color_acento` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#F1C40F',
  `texto_politica_privacidad` longtext COLLATE utf8mb4_unicode_ci,
  `texto_terminos_condiciones` longtext COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ajustes_marca`
--

LOCK TABLES `ajustes_marca` WRITE;
/*!40000 ALTER TABLE `ajustes_marca` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ajustes_marca` VALUES
(1,'Mi Web de Bodas','/img/logo-bodas.svg','#1F3C88','#F2A365','#FFFFFF','Texto de ejemplo de política de privacidad...','Texto de ejemplo de términos y condiciones...',1,'2026-01-07 18:09:35','2026-01-07 18:09:35');
/*!40000 ALTER TABLE `ajustes_marca` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `backup_runs`
--

DROP TABLE IF EXISTS `backup_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_runs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `started_at` timestamp NOT NULL,
  `finished_at` timestamp NULL DEFAULT NULL,
  `status` enum('queued','running','success','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre del archivo de backup',
  `file_size_bytes` bigint unsigned DEFAULT NULL,
  `sha256` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hash del archivo',
  `drive_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta en Google Drive',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `meta` json DEFAULT NULL COMMENT 'Duraciones, conteos, etc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backup_runs_status_index` (`status`),
  KEY `backup_runs_started_at_index` (`started_at`),
  KEY `backup_runs_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_runs`
--

LOCK TABLES `backup_runs` WRITE;
/*!40000 ALTER TABLE `backup_runs` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `backup_runs` VALUES
(1,'2026-01-08 16:59:45','2026-01-08 16:59:45','failed',NULL,NULL,NULL,NULL,'mysqldump failed: mysqldump: Got error: 2026: \"TLS/SSL error: self-signed certificate in certificate chain\" when trying to connect\n','{\"manual\": true, \"duration_seconds\": 0, \"settings_snapshot\": {\"include_db\": true, \"drive_remote\": \"https://drive.google.com/drive/folders/1M8BS8Y3FKMtCT1f4ckQ5UisVcxHqPFqW?usp=sharing\", \"include_fotos\": true, \"include_tarjetas\": true}}','2026-01-08 16:59:45','2026-01-08 16:59:45'),
(2,'2026-01-08 17:00:38',NULL,'running',NULL,NULL,NULL,NULL,NULL,'{\"manual\": true, \"settings_snapshot\": {\"include_db\": true, \"drive_remote\": \"https://drive.google.com/drive/folders/1M8BS8Y3FKMtCT1f4ckQ5UisVcxHqPFqW?usp=sharing\", \"include_fotos\": true, \"include_tarjetas\": true}}','2026-01-08 17:00:38','2026-01-08 17:00:38');
/*!40000 ALTER TABLE `backup_runs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `backup_settings`
--

DROP TABLE IF EXISTS `backup_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `timezone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'America/Lima',
  `schedule_days` json NOT NULL COMMENT '["mon", "tue", "wed", "thu", "fri", "sat", "sun"]',
  `schedule_times` json NOT NULL COMMENT '["02:00", "14:30"]',
  `retention_days` int NOT NULL DEFAULT '30' COMMENT 'Retener backups por N días',
  `include_db` tinyint(1) NOT NULL DEFAULT '1',
  `include_fotos` tinyint(1) NOT NULL DEFAULT '1',
  `include_tarjetas` tinyint(1) NOT NULL DEFAULT '1',
  `drive_provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'rclone_gdrive',
  `drive_remote` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gdrive:mi-boda/backups' COMMENT 'Ej: gdrive:mi-boda/backups',
  `max_backup_size_mb` int unsigned DEFAULT NULL,
  `last_run_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_settings`
--

LOCK TABLES `backup_settings` WRITE;
/*!40000 ALTER TABLE `backup_settings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `backup_settings` VALUES
(1,1,'America/Lima','[\"mon\", \"wed\", \"fri\"]','[\"02:00\"]',30,1,1,1,'rclone_gdrive','https://drive.google.com/drive/folders/1M8BS8Y3FKMtCT1f4ckQ5UisVcxHqPFqW?usp=sharing',NULL,NULL,'2026-01-07 18:11:04','2026-01-08 16:46:25'),
(2,0,'America/Lima','[\"mon\", \"wed\", \"fri\"]','[\"02:00\"]',30,1,1,1,'rclone_gdrive','gdrive:mi-boda/backups',NULL,NULL,'2026-01-07 18:11:04','2026-01-07 18:11:04');
/*!40000 ALTER TABLE `backup_settings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `bodas`
--

DROP TABLE IF EXISTS `bodas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bodas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `plantilla_id` bigint unsigned DEFAULT NULL,
  `nombre_pareja` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_novio_1` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_novio_2` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_contacto` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_boda` date NOT NULL,
  `ciudad` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subdominio` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dominio_personalizado` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usa_subdominio` tinyint(1) NOT NULL DEFAULT '1',
  `usa_dominio_personalizado` tinyint(1) NOT NULL DEFAULT '0',
  `dominio_verificado_at` timestamp NULL DEFAULT NULL,
  `url_publica_cache` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('activa','borrador','suspendida') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador',
  `total_invitados` int unsigned NOT NULL DEFAULT '0',
  `total_confirmados` int unsigned NOT NULL DEFAULT '0',
  `total_vistas` bigint unsigned NOT NULL DEFAULT '0',
  `fecha_publicacion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bodas_subdominio_unique` (`subdominio`),
  UNIQUE KEY `bodas_dominio_personalizado_unique` (`dominio_personalizado`),
  KEY `bodas_user_id_foreign` (`user_id`),
  KEY `bodas_plan_id_foreign` (`plan_id`),
  KEY `bodas_plantilla_id_foreign` (`plantilla_id`),
  CONSTRAINT `bodas_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `bodas_plantilla_id_foreign` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bodas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bodas`
--

LOCK TABLES `bodas` WRITE;
/*!40000 ALTER TABLE `bodas` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `bodas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `configuracion_boda`
--

DROP TABLE IF EXISTS `configuracion_boda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_boda` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `boda_id` bigint unsigned NOT NULL,
  `frase_principal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `texto_fecha_religioso` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `texto_fecha_civil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `texto_padres_novio` text COLLATE utf8mb4_unicode_ci,
  `texto_padres_novia` text COLLATE utf8mb4_unicode_ci,
  `texto_padrinos_mayores` text COLLATE utf8mb4_unicode_ci,
  `texto_padrinos_civiles` text COLLATE utf8mb4_unicode_ci,
  `cronograma_texto` text COLLATE utf8mb4_unicode_ci,
  `local_religioso` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `local_recepcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ceremonia_maps_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recepcion_maps_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `texto_cuentas_bancarias` text COLLATE utf8mb4_unicode_ci,
  `texto_yape` text COLLATE utf8mb4_unicode_ci,
  `texto_historia_pareja` text COLLATE utf8mb4_unicode_ci,
  `texto_mensaje_final` text COLLATE utf8mb4_unicode_ci,
  `texto_preguntas_frecuentes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `configuracion_boda_boda_id_foreign` (`boda_id`),
  CONSTRAINT `configuracion_boda_boda_id_foreign` FOREIGN KEY (`boda_id`) REFERENCES `bodas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_boda`
--

LOCK TABLES `configuracion_boda` WRITE;
/*!40000 ALTER TABLE `configuracion_boda` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `configuracion_boda` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `faqs_boda`
--

DROP TABLE IF EXISTS `faqs_boda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs_boda` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `boda_id` bigint unsigned NOT NULL,
  `orden` int unsigned NOT NULL DEFAULT '1',
  `pregunta` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuesta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faqs_boda_boda_id_foreign` (`boda_id`),
  CONSTRAINT `faqs_boda_boda_id_foreign` FOREIGN KEY (`boda_id`) REFERENCES `bodas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs_boda`
--

LOCK TABLES `faqs_boda` WRITE;
/*!40000 ALTER TABLE `faqs_boda` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `faqs_boda` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `faqs_plataforma`
--

DROP TABLE IF EXISTS `faqs_plataforma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs_plataforma` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `orden` int unsigned NOT NULL DEFAULT '1',
  `pregunta` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuesta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs_plataforma`
--

LOCK TABLES `faqs_plataforma` WRITE;
/*!40000 ALTER TABLE `faqs_plataforma` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `faqs_plataforma` VALUES
(1,1,'¿Puedo cambiar las fotos y textos de mi web de boda?','Sí, desde tu panel de administrador puedes actualizar fotos, frases, cronograma y más en cualquier momento.',1,'2026-01-07 18:09:36','2026-01-07 18:09:36'),
(2,2,'¿Puedo usar mi propio dominio?','Con el plan Dominio Propio puedes conectar tu dominio, por ejemplo: tusnombres.com.',1,'2026-01-07 18:09:36','2026-01-07 18:09:36'),
(3,3,'¿Los invitados necesitan registrarse?','No. Solo reciben un enlace personalizado y pueden confirmar su asistencia con un par de clics.',1,'2026-01-07 18:09:36','2026-01-07 18:09:36');
/*!40000 ALTER TABLE `faqs_plataforma` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `fotos_boda`
--

DROP TABLE IF EXISTS `fotos_boda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotos_boda` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `boda_id` bigint unsigned NOT NULL,
  `url_imagen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int unsigned NOT NULL DEFAULT '1',
  `es_portada` tinyint(1) NOT NULL DEFAULT '0',
  `es_galeria_privada` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fotos_boda_boda_id_foreign` (`boda_id`),
  CONSTRAINT `fotos_boda_boda_id_foreign` FOREIGN KEY (`boda_id`) REFERENCES `bodas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_boda`
--

LOCK TABLES `fotos_boda` WRITE;
/*!40000 ALTER TABLE `fotos_boda` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `fotos_boda` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `invitados`
--

DROP TABLE IF EXISTS `invitados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitados` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `boda_id` bigint unsigned NOT NULL,
  `codigo_clave` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_invitado` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pases` tinyint unsigned NOT NULL DEFAULT '1',
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `celular` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_acompanante` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_confirmado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_confirmacion` datetime DEFAULT NULL,
  `notas` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rsvp_card_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rsvp_card_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rsvp_card_generated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invitados_boda_id_codigo_clave_unique` (`boda_id`,`codigo_clave`),
  KEY `invitados_rsvp_card_hash_index` (`rsvp_card_hash`),
  KEY `invitados_rsvp_card_generated_at_index` (`rsvp_card_generated_at`),
  CONSTRAINT `invitados_boda_id_foreign` FOREIGN KEY (`boda_id`) REFERENCES `bodas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitados`
--

LOCK TABLES `invitados` WRITE;
/*!40000 ALTER TABLE `invitados` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `invitados` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ips_bloqueadas`
--

DROP TABLE IF EXISTS `ips_bloqueadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ips_bloqueadas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bloqueado_por` bigint unsigned DEFAULT NULL,
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int unsigned NOT NULL DEFAULT '0',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ips_bloqueadas_ip_address_unique` (`ip_address`),
  KEY `ips_bloqueadas_bloqueado_por_foreign` (`bloqueado_por`),
  KEY `ips_bloqueadas_ip_address_index` (`ip_address`),
  KEY `ips_bloqueadas_activo_bloqueado_hasta_index` (`activo`,`bloqueado_hasta`),
  CONSTRAINT `ips_bloqueadas_bloqueado_por_foreign` FOREIGN KEY (`bloqueado_por`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ips_bloqueadas`
--

LOCK TABLES `ips_bloqueadas` WRITE;
/*!40000 ALTER TABLE `ips_bloqueadas` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `ips_bloqueadas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `jobs` VALUES
(2,'default','{\"uuid\":\"3cb865fa-8ab7-4b26-9bd1-8e145780da6a\",\"displayName\":\"App\\\\Jobs\\\\RunBackupJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\RunBackupJob\",\"command\":\"O:21:\\\"App\\\\Jobs\\\\RunBackupJob\\\":11:{s:29:\\\"\\u0000App\\\\Jobs\\\\RunBackupJob\\u0000manual\\\";b:1;s:3:\\\"job\\\";N;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}}\"}}',1,1767909637,1767909624,1767909624);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `logs_auditoria`
--

DROP TABLE IF EXISTS `logs_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_auditoria` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` enum('CRITICO','MEDIO','INFO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `datos_adicionales` json DEFAULT NULL,
  `entidad_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entidad_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `logs_auditoria_usuario_id_created_at_index` (`usuario_id`,`created_at`),
  KEY `logs_auditoria_accion_index` (`accion`),
  KEY `logs_auditoria_nivel_index` (`nivel`),
  KEY `logs_auditoria_ip_address_index` (`ip_address`),
  CONSTRAINT `logs_auditoria_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_auditoria`
--

LOCK TABLES `logs_auditoria` WRITE;
/*!40000 ALTER TABLE `logs_auditoria` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `logs_auditoria` VALUES
(1,NULL,'usuario.creado','INFO','Se registró el usuario \'Redy Delgado\' (redy.delgado@gmail.com)','127.0.0.1','Symfony','{\"email\": \"redy.delgado@gmail.com\", \"nombre\": \"Redy Delgado\", \"rol_id\": 1, \"usuario_id\": 1}','App\\Models\\User',1,'2026-01-07 18:09:36','2026-01-07 18:09:36');
/*!40000 ALTER TABLE `logs_auditoria` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `logs_whatsapp_envios`
--

DROP TABLE IF EXISTS `logs_whatsapp_envios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_whatsapp_envios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invitado_id` bigint unsigned NOT NULL,
  `telefono_enviado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido_mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_envio` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `respuesta_gateway` text COLLATE utf8mb4_unicode_ci,
  `enviado_en` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `logs_whatsapp_envios_invitado_id_foreign` (`invitado_id`),
  CONSTRAINT `logs_whatsapp_envios_invitado_id_foreign` FOREIGN KEY (`invitado_id`) REFERENCES `invitados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_whatsapp_envios`
--

LOCK TABLES `logs_whatsapp_envios` WRITE;
/*!40000 ALTER TABLE `logs_whatsapp_envios` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `logs_whatsapp_envios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `metricas_plataforma`
--

DROP TABLE IF EXISTS `metricas_plataforma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `metricas_plataforma` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `total_usuarios` int unsigned NOT NULL DEFAULT '0',
  `usuarios_activos` int unsigned NOT NULL DEFAULT '0',
  `total_bodas` int unsigned NOT NULL DEFAULT '0',
  `bodas_activas` int unsigned NOT NULL DEFAULT '0',
  `ingresos_dia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `conversiones` int unsigned NOT NULL DEFAULT '0',
  `invitaciones_enviadas` int unsigned NOT NULL DEFAULT '0',
  `confirmaciones_recibidas` int unsigned NOT NULL DEFAULT '0',
  `visitas_publicas` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `metricas_plataforma_fecha_unique` (`fecha`),
  KEY `metricas_plataforma_fecha_index` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metricas_plataforma`
--

LOCK TABLES `metricas_plataforma` WRITE;
/*!40000 ALTER TABLE `metricas_plataforma` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `metricas_plataforma` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `migrations` VALUES
(1,'2013_11_28_163317_create_roles_table',1),
(2,'2014_10_12_000000_create_users_table',1),
(3,'2014_10_12_100000_create_password_reset_tokens_table',1),
(4,'2019_08_19_000000_create_failed_jobs_table',1),
(5,'2019_12_14_000001_create_personal_access_tokens_table',1),
(6,'2025_11_28_163324_create_plans_table',1),
(7,'2025_11_28_163333_create_plantillas_table',1),
(8,'2025_11_28_163342_create_bodas_table',1),
(9,'2025_11_28_163350_create_configuracion_bodas_table',1),
(10,'2025_11_28_163524_create_foto_bodas_table',1),
(11,'2025_11_28_163532_create_invitados_table',1),
(12,'2025_11_28_163540_create_log_whatsapp_envios_table',1),
(13,'2025_11_28_163618_create_ajuste_marcas_table',1),
(14,'2025_11_28_163704_create_faq_plataformas_table',1),
(15,'2025_12_01_024426_create_faq_boda_table',1),
(16,'2025_12_18_224919_create_jobs_table',1),
(17,'2025_12_18_235959_crear_tarjeta_disenos_table',1),
(18,'2025_12_20_182050_crear_tabla_metricas_plataforma',1),
(19,'2025_12_20_182054_crear_tabla_sesiones_activas',1),
(20,'2025_12_20_182104_crear_tabla_ips_bloqueadas',1),
(21,'2025_12_20_182133_crear_tabla_logs_auditoria',1),
(22,'2025_12_20_182932_agregar_campos_auditoria_usuarios',1),
(23,'2026_01_07_000001_create_backup_settings_table',1),
(24,'2026_01_07_000002_create_backup_runs_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',1,'api-token','874e06ecc005f36a27179ce219ac75a66e8b7828920a3be89dd52abd5da35e45','[\"*\"]','2026-01-07 18:15:53',NULL,'2026-01-07 18:10:56','2026-01-07 18:15:53'),
(2,'App\\Models\\User',1,'api-token','1da39099e915c97e03248998a2e77a41265e83f075ef634bd120fa5b48dcaff0','[\"*\"]','2026-01-07 18:53:04',NULL,'2026-01-07 18:44:43','2026-01-07 18:53:04'),
(3,'App\\Models\\User',1,'api-token','1885b2e43927c237ed79028ee8b40fb2d75f6a2eabee690c740f41a8cca812e0','[\"*\"]','2026-01-07 18:55:34',NULL,'2026-01-07 18:55:13','2026-01-07 18:55:34'),
(4,'App\\Models\\User',1,'api-token','93d0d49e0d91b136be1651011f0e35bf870e1b25d05b47fa01260d451d43a9b8','[\"*\"]','2026-01-08 16:53:14',NULL,'2026-01-08 09:33:22','2026-01-08 16:53:14');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `planes`
--

DROP TABLE IF EXISTS `planes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_corta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio_monetario` decimal(10,2) DEFAULT NULL,
  `moneda` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PEN',
  `incluye_subdominio` tinyint(1) NOT NULL DEFAULT '1',
  `permite_dominio_propio` tinyint(1) NOT NULL DEFAULT '0',
  `invitados_ilimitados` tinyint(1) NOT NULL DEFAULT '1',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `planes_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes`
--

LOCK TABLES `planes` WRITE;
/*!40000 ALTER TABLE `planes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `planes` VALUES
(1,'Plan Subdominio','subdominio','Crea tu web con subdominio gratuito',0.00,'PEN',1,0,1,1,'2026-01-07 18:09:35','2026-01-07 18:09:35'),
(2,'Plan Dominio Propio','dominio-propio','Usa tu propio dominio para tu boda',150.00,'PEN',1,1,1,1,'2026-01-07 18:09:35','2026-01-07 18:09:35');
/*!40000 ALTER TABLE `planes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `plantillas`
--

DROP TABLE IF EXISTS `plantillas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_corta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_activa` tinyint(1) NOT NULL DEFAULT '1',
  `conteo_usos` int unsigned NOT NULL DEFAULT '0',
  `preview_imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plantillas_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas`
--

LOCK TABLES `plantillas` WRITE;
/*!40000 ALTER TABLE `plantillas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `plantillas` VALUES
(1,'Azul acero & dorado','azul-acero-dorado','Estilo elegante con tonos azul acero y dorado.',1,0,'/img/plantillas/azul-acero-dorado.png','2026-01-07 18:09:35','2026-01-07 18:09:35'),
(2,'Coral tropical','coral-tropical','Colores cálidos y vibrantes, ideal para climas tropicales.',1,0,'/img/plantillas/coral-tropical.png','2026-01-07 18:09:35','2026-01-07 18:09:35'),
(3,'Verde esmeralda','verde-esmeralda','Diseño sobrio con énfasis en la naturaleza.',1,0,'/img/plantillas/verde-esmeralda.png','2026-01-07 18:09:35','2026-01-07 18:09:35');
/*!40000 ALTER TABLE `plantillas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `roles` VALUES
(1,'superadmin','Administrador general de la plataforma','2026-01-07 18:09:35','2026-01-07 18:09:35'),
(2,'admin_boda','Administrador de una boda específica','2026-01-07 18:09:35','2026-01-07 18:09:35');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `sesiones_activas`
--

DROP TABLE IF EXISTS `sesiones_activas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_activas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `token` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `ultima_actividad` timestamp NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sesiones_activas_token_unique` (`token`),
  KEY `sesiones_activas_usuario_id_ultima_actividad_index` (`usuario_id`,`ultima_actividad`),
  KEY `sesiones_activas_token_index` (`token`),
  CONSTRAINT `sesiones_activas_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_activas`
--

LOCK TABLES `sesiones_activas` WRITE;
/*!40000 ALTER TABLE `sesiones_activas` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `sesiones_activas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `tarjeta_disenos`
--

DROP TABLE IF EXISTS `tarjeta_disenos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarjeta_disenos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `boda_id` bigint unsigned NOT NULL,
  `plantilla_ruta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diseno_json` json DEFAULT NULL,
  `estado_generacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultimo_conteo_generado` int unsigned NOT NULL DEFAULT '0',
  `ultima_generacion_at` timestamp NULL DEFAULT NULL,
  `ruta_vista_previa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_por` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tarjeta_disenos_boda_id_index` (`boda_id`),
  CONSTRAINT `tarjeta_disenos_boda_id_foreign` FOREIGN KEY (`boda_id`) REFERENCES `bodas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarjeta_disenos`
--

LOCK TABLES `tarjeta_disenos` WRITE;
/*!40000 ALTER TABLE `tarjeta_disenos` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `tarjeta_disenos` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` bigint unsigned DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `suspendido` tinyint(1) NOT NULL DEFAULT '0',
  `razon_suspension` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_rol_id_foreign` (`rol_id`),
  CONSTRAINT `users_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'Redy Delgado','redy.delgado@gmail.com',NULL,'$2y$12$v.4QhRj/NEX2R0NgYc2jnusbIoJk7T97fp4u62dJ.1oKvRsG9cWfK',1,NULL,1,0,NULL,NULL,NULL,'2026-01-07 18:09:36','2026-01-07 18:09:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-01-08 22:00:39
