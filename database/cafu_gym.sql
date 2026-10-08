-- CAFU GYM: skema + data awal (MariaDB/MySQL)
-- Impor lewat phpMyAdmin (tab Import) atau: mysql -u root -p < cafu_gym.sql
-- Login contoh: admin@cafu.com / admin123 dan cafu@gmail.com / 123456

/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `cafu_gym` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `cafu_gym`;
DROP TABLE IF EXISTS `gym_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_packages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'durasi dalam bulan',
  `price` decimal(12,2) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `gym_packages` DISABLE KEYS */;
INSERT INTO `gym_packages` VALUES (1,'Basic',1,100000.00,'Akses gym reguler, loker, dan area kardio.','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `gym_packages` VALUES (2,'Standard',3,250000.00,'Semua di Basic, ditambah kelas kelompok.','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `gym_packages` VALUES (3,'Premium',6,450000.00,'Semua di Standard, ditambah evaluasi tubuh berkala.','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `gym_packages` VALUES (4,'Annual',12,800000.00,'Akses penuh setahun dengan harga paling hemat.','2026-09-29 23:30:02','2026-09-29 23:30:02');
/*!40000 ALTER TABLE `gym_packages` ENABLE KEYS */;
DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_members_user` (`user_id`),
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,2,'08123456789','Jakarta','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `members` VALUES (2,3,'081298765432','Bandung','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `members` VALUES (3,4,'085711223344','Depok','2026-09-29 23:30:02','2026-09-29 23:30:02');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `member_id` bigint(20) unsigned NOT NULL,
  `package_id` bigint(20) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT 'ACTIVE/EXPIRED/PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_memberships_member` (`member_id`),
  KEY `idx_memberships_status_end` (`status`,`end_date`),
  KEY `fk_memberships_package` (`package_id`),
  CONSTRAINT `fk_memberships_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_memberships_package` FOREIGN KEY (`package_id`) REFERENCES `gym_packages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES (1,1,2,'2026-09-20','2026-12-20','ACTIVE','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `memberships` VALUES (2,2,1,'2026-08-20','2026-09-20','EXPIRED','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `memberships` VALUES (3,3,3,'2026-09-27','2027-03-27','ACTIVE','2026-09-29 23:30:02','2026-09-29 23:30:02');
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `membership_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PAID/PENDING/CANCELLED',
  `method` varchar(10) DEFAULT NULL COMMENT 'QRIS/CASH',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_payments_membership` (`membership_id`),
  KEY `idx_payments_status` (`status`),
  CONSTRAINT `fk_payments_membership` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,250000.00,'2026-09-20','PAID','QRIS','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `payments` VALUES (2,2,100000.00,'2026-08-20','PAID','CASH','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `payments` VALUES (3,3,450000.00,'2026-09-27','PAID','QRIS','2026-09-29 23:30:02','2026-09-29 23:30:02');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('member','admin') NOT NULL DEFAULT 'member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin CAFU','admin@cafu.com','$2a$10$vmOGovhtmXGE/6yRUppi.uKW39nNsCQwT.sNAXMIee/I6.Xyav/pu','admin','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `users` VALUES (2,'Cafu','cafu@gmail.com','$2a$10$WWWyAxF5xTV/eGVeCZ0TP.7Quu2xD3nhtoqDHWl66iDoEFMI17Cny','member','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `users` VALUES (3,'Rina Putri','rina@mail.com','$2a$10$Jle8MLPwbHSyjVWstB0XoeRAXm93oJ2J7PfUc2PIhmQa6JwDIyMYK','member','2026-09-29 23:30:02','2026-09-29 23:30:02');
INSERT INTO `users` VALUES (4,'Bagas Pratama','bagas@mail.com','$2a$10$qDecyScGRm3GXlTJd4pkfOWGTe8hcScnUj2FHkezPmQvDCHWy0cB.','member','2026-09-29 23:30:02','2026-09-29 23:30:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

