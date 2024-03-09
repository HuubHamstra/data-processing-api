/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `hbomin` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `hbomin`;

CREATE TABLE IF NOT EXISTS `account` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `blocked_end_time` datetime DEFAULT NULL,
  `email_validated` tinyint(1) NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `account_email_password_view` (
	`email` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`password` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE `account_junior_view` (
	`account_id` INT(11) NOT NULL,
	`blocked_end_time` DATETIME NULL,
	`email_validated` TINYINT(1) NOT NULL
) ENGINE=MyISAM;

CREATE TABLE `account_medior_view` (
	`account_id` INT(11) NOT NULL,
	`blocked_end_time` DATETIME NULL,
	`first_name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`last_name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`email_validated` TINYINT(1) NOT NULL
) ENGINE=MyISAM;

DELIMITER //
CREATE PROCEDURE `add_to_watchlist`(
  IN user_profile_id INT(11),
  IN is_episode BOOLEAN,
  IN watch_id INT(11)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_profile_id = user_profile_id;
  SET @watch_id = watch_id;
  IF is_episode THEN
    PREPARE stmt FROM 'INSERT INTO watchlist (profile_id, episode_id) VALUES (@user_profile_id, @watch_id);';
  ELSE
    PREPARE stmt FROM 'INSERT INTO watchlist (profile_id, movie_id) VALUES (@user_profile_id, @watch_id);';
  END IF;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('WatchlistAdd', CONCAT('Added to watchlist: ', user_profile_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Watchlist add failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `change_subscription`(
  IN user_account_id INT(11),
  IN user_subscription_id INT(11)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_account_id = user_account_id;
  SET @user_subscription_id = user_subscription_id;
  PREPARE stmt FROM 'INSERT INTO subscription_record (account_id, subscription_id, start_date) VALUES (@user_account_id, @user_subscription_id, NOW());';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('SubscriptionChange', CONCAT('Subscription changed: ', user_account_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Subscription change failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `create_account`(
  IN user_first_name VARCHAR(255),
  IN user_last_name VARCHAR(255),
  IN user_email VARCHAR(255),
  IN user_password VARCHAR(255),
  IN user_payment_method VARCHAR(50),
  IN user_subscription_id INT(11),
  IN user_profile_name VARCHAR(255),
  IN user_profile_image VARCHAR(255),
  IN user_profile_age INT(11),
  IN user_language_id INT(11),
  IN user_view_movies TINYINT(1),
  IN user_view_series TINYINT(1),
  IN user_min_age INT(11)
)
BEGIN
  DECLARE new_account_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_first_name = user_first_name;
  SET @user_last_name = user_last_name;
  SET @user_email = user_email;
  SET @hashed_password = user_password;
  SET @user_payment_method = user_payment_method;
  PREPARE stmt FROM 'INSERT INTO account (first_name, last_name, email, password, payment_method, blocked_end_time, email_validated) VALUES (@user_first_name, @user_last_name, @user_email, @hashed_password, @user_payment_method, CURDATE(), false)';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET new_account_id = LAST_INSERT_ID();

  CALL change_subscription(new_account_id, user_subscription_id);
  CALL create_profile(new_account_id, user_profile_name, user_profile_image, user_profile_age, user_language_id, user_view_movies, user_view_series, user_min_age);
  
  IF ROW_COUNT() > 0 THEN
    CALL change_subscription(new_account_id, user_subscription_id);
    CALL create_profile(new_account_id, user_profile_name, user_profile_image, user_profile_age, user_language_id, user_view_movies, user_view_series, user_min_age);

    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('AccountCreation', CONCAT('Account created for user ', user_email));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Account creation failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `create_profile`(
  IN user_account_id INT(11),
  IN user_profile_name VARCHAR(255),
  IN user_profile_image VARCHAR(255),
  IN user_profile_age INT(11),
  IN user_language_id INT(11),
  IN user_view_movies TINYINT(1),
  IN user_view_series TINYINT(1),
  IN user_min_age INT(11)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_view_movies = user_view_movies;
  SET @user_view_series = user_view_series;
  SET @user_min_age = user_min_age;
  PREPARE pref_stmt FROM 'INSERT INTO preference (view_movies, view_series, min_age) VALUES (@user_view_movies, @user_view_series, @user_min_age);';
  EXECUTE pref_stmt;
  DEALLOCATE PREPARE pref_stmt;

  SET @user_account_id = user_account_id;
  SET @user_profile_name = user_profile_name;
  SET @user_profile_image = user_profile_image;
  SET @user_profile_age = user_profile_age;
  SET @user_language_id = user_language_id;
  PREPARE stmt FROM 'INSERT INTO profile (account_id, profile_name, profile_image, profile_age, language_id, preference_id) VALUES (@user_account_id, @user_profile_name, @user_profile_image, @user_profile_age, @user_language_id, LAST_INSERT_ID());';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('ProfileCreation', CONCAT('Profile created: ', user_profile_name));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Profile creation failed.";
  END IF;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS `definition_type` (
  `definition_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`definition_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `definition_type_view` (
	`definition_type_id` INT(11) NOT NULL,
	`name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `episode` (
  `episode_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `description` text DEFAULT NULL,
  `definition_type_id` int(11) DEFAULT NULL,
  `season_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`episode_id`),
  KEY `fk_definition_type_id` (`definition_type_id`),
  KEY `fk_season` (`season_id`),
  CONSTRAINT `fk_definition_type_id` FOREIGN KEY (`definition_type_id`) REFERENCES `definition_type` (`definition_type_id`),
  CONSTRAINT `fk_season` FOREIGN KEY (`season_id`) REFERENCES `season` (`season_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `episode_view` (
	`episode_id` INT(11) NOT NULL,
	`title` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`duration` TIME NULL,
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`definition_type_id` INT(11) NULL,
	`season_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `episode_viewer_guide` (
  `episode_viewer_guide_id` int(11) NOT NULL AUTO_INCREMENT,
  `episode_id` int(11) DEFAULT NULL,
  `viewer_guide_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`episode_viewer_guide_id`),
  KEY `fk_episode_id` (`episode_id`),
  KEY `fk_viewer_guide_id` (`viewer_guide_id`),
  CONSTRAINT `fk_episode_id` FOREIGN KEY (`episode_id`) REFERENCES `episode` (`episode_id`),
  CONSTRAINT `fk_viewer_guide_id` FOREIGN KEY (`viewer_guide_id`) REFERENCES `viewer_guide` (`viewer_guide_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `episode_viewer_guide_view` (
	`episode_viewer_guide_id` INT(11) NOT NULL,
	`episode_id` INT(11) NULL,
	`viewer_guide_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE `episode_watch_count_view` (
	`episode_id` INT(11) NULL,
	`total_watch_count` DECIMAL(32,0) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `genre` (
  `genre_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`genre_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `genre_view` (
	`genre_id` INT(11) NOT NULL,
	`title` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

DELIMITER //
CREATE PROCEDURE `get_daily_income`(
  IN date_of DATE
)
BEGIN
  SELECT SUM(subscription.subscription_price) FROM subscription JOIN subscription_record ON subscription.subscription_id = subscription_record.subscription_id WHERE subscription_record.start_date = date_of;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_full_name`(
  IN user_email VARCHAR(255)
)
BEGIN
  SELECT first_name, last_name FROM account WHERE email = user_email;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_login_data`(
  IN user_email VARCHAR(255)
)
BEGIN
  SELECT email, password FROM account_email_password_view WHERE email = user_email LIMIT 1;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_movies_available_with_definition`(
  IN user_definition_type INT(11), 
  IN user_preference_id INT(11)
)
BEGIN
  DECLARE viewer_guide_list VARCHAR(255);
  SELECT GROUP_CONCAT(name ORDER BY guide_id ASC) INTO viewer_guide_list FROM viewer_guide WHERE guide_id IN (SELECT viewer_guide_id FROM preference_viewer_guide WHERE preference_id = user_preference_id);

  CREATE TEMPORARY TABLE temp_result AS SELECT mv.movie_id, mv.title, mv.duration, mv.description, dt.name AS definition_type, gn.name AS genre, mvv.viewer_guides FROM movie_view mv LEFT JOIN definition_type dt ON mv.definition_type = dt.definition_type_id JOIN genre gn ON mv.genre_id = gn.genre_id LEFT JOIN movie_viewer_guide_view mvv ON mv.movie_id = mvv.movie_id;
  DELETE FROM temp_result WHERE (user_definition_type IS NOT NULL AND temp_result.definition_type != user_definition_type) OR (viewer_guide_list IS NOT NULL AND FIND_IN_SET(temp_result.viewer_guides, viewer_guide_list) = 0);
  SELECT * FROM temp_result;
  DROP TEMPORARY TABLE IF EXISTS temp_result;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_movie_count`()
BEGIN
  SELECT COUNT(movie_id) AS movie_count FROM movie;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_subscription_definition`(
  IN user_subscription_id INT(11)
)
BEGIN
  SELECT definition_type.name FROM subscription_definition_view WHERE subscription.subscription_id = user_subscription_id;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_subtitle_languages`(
  IN is_episode BOOLEAN,
  IN watch_id INT(11)
)
BEGIN
  IF is_episode THEN
    SELECT subtitle.subtitle_location, languages.title FROM subtitle JOIN languages ON subtitle.language_id = languages.id WHERE subtitles.episode_id = watch_id;
  ELSE
    SELECT subtitle.subtitle_location, languages.title FROM subtitle JOIN languages ON subtitle.language_id = languages.id WHERE subtitles.movie_id = watch_id;
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_total_income`()
BEGIN
	DECLARE total_income DECIMAL(10, 2) DEFAULT 0.0;
    
    SELECT SUM(subscription.subscription_price) INTO total_income
    FROM subscription
    JOIN subscription_record ON subscription.subscription_id = subscription_record.subscription_id;
    
    SELECT total_income AS total_subscription_income;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `get_watch_count`(
  IN is_episode BOOLEAN,
  IN watch_id INT(11)
)
BEGIN
  IF is_episode THEN
    SELECT total_watch_count FROM episode_watch_count_view WHERE episode_id = watch_id;
  ELSE
    SELECT total_watch_count FROM movie_watch_count_view WHERE movie_id = watch_id;
  END IF;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS `language` (
  `language_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`language_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `language_junior_view` (
	`language_id` INT(11) NOT NULL,
	`title` VARCHAR(100) NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `movie` (
  `movie_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `definition_type_id` int(11) DEFAULT NULL,
  `genre_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`movie_id`),
  KEY `FK_definition_type` (`definition_type_id`),
  KEY `FK_genre` (`genre_id`),
  CONSTRAINT `FK_definition_type` FOREIGN KEY (`definition_type_id`) REFERENCES `definition_type` (`definition_type_id`),
  CONSTRAINT `FK_genre` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `movie_junior_view` (
	`movie_id` INT(11) NOT NULL,
	`title` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`duration` INT(11) NULL,
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`definition_type_id` INT(11) NULL,
	`genre_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE `movie_view` (
	`movie_id` INT(11) NOT NULL,
	`title` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`duration` INT(11) NULL,
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`genre` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`viewer_guides` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `movie_viewer_guide` (
  `movie_viewer_guide_id` int(11) NOT NULL AUTO_INCREMENT,
  `movie_id` int(11) DEFAULT NULL,
  `viewer_guide_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`movie_viewer_guide_id`),
  KEY `FK_movie` (`movie_id`),
  KEY `FK_viewer_guide` (`viewer_guide_id`),
  CONSTRAINT `FK_movie` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `FK_viewer_guide` FOREIGN KEY (`viewer_guide_id`) REFERENCES `viewer_guide` (`viewer_guide_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `movie_viewer_guide_junior_view` (
	`movie_viewer_guide_id` INT(11) NOT NULL,
	`movie_id` INT(11) NULL,
	`viewer_guide_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE `movie_viewer_guide_view` (
	`movie_id` INT(11) NOT NULL,
	`viewer_guides` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE `movie_watch_count_view` (
	`movie_id` INT(11) NULL,
	`total_watch_count` DECIMAL(32,0) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `preference` (
  `preference_id` int(11) NOT NULL AUTO_INCREMENT,
  `view_movies` tinyint(1) DEFAULT NULL,
  `view_series` tinyint(1) DEFAULT NULL,
  `min_age` int(11) DEFAULT NULL,
  PRIMARY KEY (`preference_id`),
  UNIQUE KEY `preference_id_UNIQUE` (`preference_id`)
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `preference_genre` (
  `preference_genre_id` int(11) NOT NULL AUTO_INCREMENT,
  `preference_id` int(11) DEFAULT NULL,
  `genre_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`preference_genre_id`),
  KEY `preference_id` (`preference_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `preference_genre_ibfk_1` FOREIGN KEY (`preference_id`) REFERENCES `preference` (`preference_id`),
  CONSTRAINT `preference_genre_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `preference_genre_view` (
	`preference_genre_id` INT(11) NOT NULL,
	`preference_id` INT(11) NULL,
	`genre_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE `preference_view` (
	`preference_id` INT(11) NOT NULL,
	`view_movies` TINYINT(1) NULL,
	`view_series` TINYINT(1) NULL,
	`min_age` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `preference_viewer_guide` (
  `preference_viewer_guide_id` int(11) NOT NULL AUTO_INCREMENT,
  `preference_id` int(11) DEFAULT NULL,
  `viewer_guide_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`preference_viewer_guide_id`),
  KEY `preference_id` (`preference_id`),
  KEY `viewer_guide_id` (`viewer_guide_id`),
  CONSTRAINT `preference_viewer_guide_ibfk_1` FOREIGN KEY (`preference_id`) REFERENCES `preference` (`preference_id`),
  CONSTRAINT `preference_viewer_guide_ibfk_2` FOREIGN KEY (`viewer_guide_id`) REFERENCES `viewer_guide` (`viewer_guide_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `preference_viewer_guide_view` (
	`preference_viewer_guide_id` INT(11) NOT NULL,
	`preference_id` INT(11) NULL,
	`viewer_guide_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `profile` (
  `profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `profile_name` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `profile_age` int(11) DEFAULT NULL,
  `language_id` int(11) DEFAULT NULL,
  `preference_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`profile_id`),
  KEY `account_id` (`account_id`),
  KEY `language_id` (`language_id`),
  KEY `preference_id` (`preference_id`),
  CONSTRAINT `profile_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  CONSTRAINT `profile_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `language` (`language_id`),
  CONSTRAINT `profile_ibfk_3` FOREIGN KEY (`preference_id`) REFERENCES `preference` (`preference_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `profile_junior_view` (
	`profile_id` INT(11) NOT NULL,
	`account_id` INT(11) NULL,
	`profile_name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`profile_image` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`profile_age` INT(11) NULL,
	`language_id` INT(11) NULL,
	`preference_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `progress` (
  `progress_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) DEFAULT NULL,
  `episode_id` int(11) DEFAULT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `watch_date` date DEFAULT NULL,
  `watch_count` int(11) DEFAULT NULL,
  PRIMARY KEY (`progress_id`),
  KEY `episode_id` (`episode_id`),
  KEY `movie_id` (`movie_id`),
  KEY `progress_ibfk_1_idx` (`profile_id`),
  CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`),
  CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`episode_id`) REFERENCES `episode` (`episode_id`),
  CONSTRAINT `progress_ibfk_3` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `progress_view` (
	`progress_id` INT(11) NOT NULL,
	`profile_id` INT(11) NULL,
	`episode_id` INT(11) NULL,
	`movie_id` INT(11) NULL,
	`timestamp` DATETIME NULL,
	`watch_date` DATE NULL,
	`watch_count` INT(11) NULL
) ENGINE=MyISAM;

DELIMITER //
CREATE PROCEDURE `remove_from_watchlist`(
  IN user_profile_id INT(11),
  IN is_episode BOOLEAN,
  IN watch_id INT(11)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_profile_id = user_profile_id;
  SET @watch_id = watch_id;
  IF is_episode THEN
    PREPARE stmt FROM 'DELETE FROM watchlist WHERE profile_id = @user_profile_id AND episode_id = @watch_id;';
  ELSE
    PREPARE stmt FROM 'DELETE FROM watchlist WHERE profile_id = @user_profile_id AND movie_id = @watch_id;';
  END IF;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('WatchlistRemove', CONCAT('Removed from watchlist: ', user_profile_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Watchlist remove failed.";
  END IF;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS `season` (
  `season_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` text DEFAULT NULL,
  `series_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`season_id`),
  KEY `series_id` (`series_id`),
  CONSTRAINT `season_ibfk_1` FOREIGN KEY (`series_id`) REFERENCES `series` (`series_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `season_view` (
	`season_id` INT(11) NOT NULL,
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`series_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `series` (
  `series_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `genre_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`series_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `series_ibfk_1` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `series_view` (
	`series_id` INT(11) NOT NULL,
	`name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`genre_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `subscription` (
  `subscription_id` int(11) NOT NULL AUTO_INCREMENT,
  `definition_type` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `subscription_price` decimal(10,2) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  PRIMARY KEY (`subscription_id`),
  KEY `definition_type` (`definition_type`),
  CONSTRAINT `subscription_ibfk_1` FOREIGN KEY (`definition_type`) REFERENCES `definition_type` (`definition_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscription_definition_view` (
	`subscription_id` INT(11) NOT NULL,
	`name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE `subscription_junior_view` (
	`subscription_id` INT(11) NOT NULL,
	`definition_type` INT(11) NULL,
	`description` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`subscription_price` DECIMAL(10,2) NULL,
	`duration` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `subscription_record` (
  `subscription_record_id` int(11) NOT NULL AUTO_INCREMENT,
  `start_date` date DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`subscription_record_id`),
  KEY `account_id` (`account_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `subscription_record_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  CONSTRAINT `subscription_record_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`subscription_id`)
) ENGINE=InnoDB AUTO_INCREMENT=277 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscription_record_junior_view` (
	`subscription_record_id` INT(11) NOT NULL,
	`account_id` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE `subscription_record_medior_view` (
	`subscription_record_id` INT(11) NOT NULL,
	`account_id` INT(11) NULL,
	`start_date` DATE NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `subtitle` (
  `subtitle_id` int(11) NOT NULL AUTO_INCREMENT,
  `subtitle_location` varchar(255) DEFAULT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `episode_id` int(11) DEFAULT NULL,
  `language_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`subtitle_id`),
  KEY `movie_id` (`movie_id`),
  KEY `episode_id` (`episode_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `subtitle_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `subtitle_ibfk_2` FOREIGN KEY (`episode_id`) REFERENCES `episode` (`episode_id`),
  CONSTRAINT `subtitle_ibfk_3` FOREIGN KEY (`language_id`) REFERENCES `language` (`language_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subtitle_view` (
	`subtitle_id` INT(11) NOT NULL,
	`subtitle_location` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`movie_id` INT(11) NULL,
	`episode_id` INT(11) NULL,
	`language_id` INT(11) NULL
) ENGINE=MyISAM;

DELIMITER //
CREATE PROCEDURE `update_definition_type_medior`(
  IN update_definition_type_id INT(11),
  IN new_name VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  UPDATE definition_type SET name = new_name WHERE definition_type_id = update_definition_type_id;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('DefinitionTypeUpdate', CONCAT('Definition type update: ', update_definition_type_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating definition type failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_episode_medior`(
  IN update_episode_id INT(11),
  IN new_title VARCHAR(255),
  IN new_description TEXT,
  IN update_title BOOLEAN,
  IN update_description BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  IF update_title THEN
    UPDATE episode SET title = new_title WHERE episode_id = update_episode_id;
  END IF;
  
  IF update_description THEN
    UPDATE episode SET description = new_description WHERE episode_id = update_episode_id;
  END IF;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('EpisodeUpdate', CONCAT('Episode update: ', update_episode_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating episode failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_genre_medior`(
  IN update_genre_id INT(11),
  IN new_title VARCHAR(255),
  IN new_description TEXT,
  IN update_title BOOLEAN,
  IN update_description BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  IF update_title THEN
    UPDATE genre SET title = new_title WHERE genre_id = update_genre_id;
  END IF;
  
  IF update_description THEN
    UPDATE genre SET description = new_description WHERE genre_id = update_genre_id;
  END IF;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('GenreUpdate', CONCAT('Genre update: ', update_genre_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating genre failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_language_title`(
  IN update_language_id INT(11),
  IN new_title VARCHAR(100)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @update_language_id = update_language_id;
  SET @new_title = new_title;
  PREPARE stmt FROM 'UPDATE language SET title = @new_title WHERE language_id = @update_language_id;';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('LanguageTitleUpdate', CONCAT('Language title updated: ', new_title));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Update language title failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_login_data`(
  IN user_email VARCHAR(255),
  IN user_password VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Password update failed.";
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_email = user_email;
  SET @user_password = user_password;
  PREPARE stmt FROM 'UPDATE account SET password = @user_password WHERE email = @user_email;';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  IF @affected_rows > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('PasswordUpdate', CONCAT('Password updated: ', user_email));
  ELSE
    ROLLBACK;
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_movie_medior`(
  IN update_movie_id INT(11),
  IN new_title VARCHAR(255),
  IN new_description TEXT,
  IN update_title BOOLEAN,
  IN update_description BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  IF update_title THEN
    UPDATE movie SET title = new_title WHERE movie_id = update_movie_id;
  END IF;
  
  IF update_description THEN
    UPDATE movie SET description = new_description WHERE movie_id = update_movie_id;
  END IF;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('MovieUpdate', CONCAT('Movie update: ', update_movie_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating movie failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_preference_medior`(
  IN update_preference_id INT(11),
  IN new_min_age INT(11)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @update_preference_id = update_preference_id;
  SET @new_min_age = new_min_age;
  PREPARE stmt FROM 'UPDATE preference SET min_age = @new_min_age WHERE preference_id = @update_preference_id;';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('PreferenceUpdate', CONCAT('Preference updated: ', update_preference_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Preference update failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_profile`(
  IN user_account_id INT(11),
  IN user_profile_name VARCHAR(255),
  IN user_profile_image VARCHAR(255),
  IN user_profile_age INT(11),
  IN update_name BOOLEAN,
  IN update_image BOOLEAN,
  IN update_age BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @update_query = 'UPDATE profile SET ';

  IF update_name THEN
    SET @update_query = CONCAT(@update_query, 'profile_name = "', user_profile_name, '"');
  END IF;

  IF update_name AND (update_image OR update_age) THEN
    SET @update_query = CONCAT(@update_query, ', ');
  END IF;

  IF update_image THEN
    SET @update_query = CONCAT(@update_query, 'profile_image = "', user_profile_image, '"');
  END IF;

  IF (update_name OR update_image) AND update_age THEN
    SET @update_query = CONCAT(@update_query, ', ');
  END IF;

  IF update_age THEN
    SET @update_query = CONCAT(@update_query, 'profile_age = ', user_profile_age);
  END IF;

  SET @update_query = CONCAT(@update_query, ' WHERE account_id = ', user_account_id);

  PREPARE stmt FROM @update_query;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('UpdateProfile', CONCAT('Profile updated: ', user_account_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Update profile failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_profile_medior`(
  IN update_profile_id INT(11),
  IN user_profile_image VARCHAR(255),
  IN user_profile_age INT(11),
  IN update_profile_image BOOLEAN,
  IN update_profile_age BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @update_profile_id = update_profile_id;
  SET @user_profile_image = user_profile_image;
  SET @user_profile_age = user_profile_age;

  IF update_profile_image THEN
    PREPARE img_stmt FROM 'UPDATE profile SET profile_image = @new_profile_image WHERE profile_id = @update_profile_id;';
    EXECUTE img_stmt;
    DEALLOCATE PREPARE img_stmt;
  END IF;

  IF update_profile_age THEN
    PREPARE age_stmt FROM 'UPDATE profile SET profile_age = @new_profile_age WHERE profile_id = @update_profile_id;';
    EXECUTE age_stmt;
    DEALLOCATE PREPARE age_stmt;
  END IF;

  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('ProfileUpdateMedior', CONCAT('Updated profile: ', update_profile_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Profile update (medior) failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_progress`(
  IN user_profile_id INT(11),
  IN is_episode BOOLEAN,
  IN progress_movie_id INT(11),
  IN progress_episode_id INT(11),
  IN progress_timestamp datetime
  )
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_profile_id = user_profile_id;
  SET @is_episode = is_episode;
  SET @progress_movie_id = progress_movie_id;
  SET @progress_episode_id = progress_episode_id;
  SET @progress_timestamp = progress_timestamp;
  PREPARE stmt FROM 'UPDATE progress SET timestamp = @progress_timestamp, watch_date = CURDATE(), watch_count = watch_count + 1 WHERE profile_id = @user_profile_id AND (@is_episode AND episode_id = @progress_episode_id OR (NOT @is_episode AND movie_id = @progress_movie_id));';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  

  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('ProgressUpdate', CONCAT('Progress updated: ', user_profile_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Progress update failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_season_medior`(
  IN update_season_id INT(11),
  IN new_name VARCHAR(255),
  IN new_description TEXT,
  IN update_name BOOLEAN,
  IN update_description BOOLEAN
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  UPDATE season SET description = new_description WHERE season_id = update_season_id;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('SeasonUpdate', CONCAT('Season description update: ', update_season_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating season failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_subtitle_medior`(
  IN update_subtitle_id INT(11),
  IN new_subtitle_location VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @update_subtitle_id = update_subtitle_id;
  SET @new_subtitle_location = new_subtitle_location;
  PREPARE stmt FROM 'UPDATE subtitle SET subtitle_location = @new_subtitle_location WHERE subtitle_id = @update_subtitle_id;';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('SubtitleUpdate', CONCAT('Subtitle updated: ', update_subtitle_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating subtitle failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `update_viewer_guide_medior`(
  IN update_viewer_guide_id INT(11),
  IN new_name VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  UPDATE viewer_guide SET name = new_name WHERE viewer_guide_id = update_viewer_guide_id;
  
  IF ROW_COUNT() > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('ViewerGuideUpdate', CONCAT('Viewer guide update: ', update_viewer_guide_id));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Updating viewer guide procedure failed.";
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE `validate_email`(
  IN user_email VARCHAR(255)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN  
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Error: Email validation failed.";
  END;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  SET @user_email = user_email;  
  PREPARE stmt FROM 'UPDATE account SET email_validated = true WHERE email = @user_email;';
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  IF @affected_rows > 0 THEN
    COMMIT;
    INSERT INTO audit_log (event_type, event_description) VALUES ('ValidateEmail', CONCAT('Email validated: ', user_email));
  ELSE
    ROLLBACK;
  END IF;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS `viewer_guide` (
  `viewer_guide_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`viewer_guide_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `viewer_guide_view` (
	`viewer_guide_id` INT(11) NOT NULL,
	`name` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `watchlist` (
  `watchlist_id` int(11) NOT NULL AUTO_INCREMENT,
  `movie_id` int(11) DEFAULT NULL,
  `series_id` int(11) DEFAULT NULL,
  `profile_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`watchlist_id`),
  KEY `movie_id` (`movie_id`),
  KEY `series_id` (`series_id`),
  KEY `watchlist_ibfk_3_idx` (`profile_id`),
  CONSTRAINT `watchlist_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `watchlist_ibfk_2` FOREIGN KEY (`series_id`) REFERENCES `series` (`series_id`),
  CONSTRAINT `watchlist_ibfk_3` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `watchlist_view` (
	`watchlist_id` INT(11) NOT NULL,
	`profile_id` INT(11) NULL,
	`movie_id` INT(11) NULL,
	`movie_title` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`series_id` INT(11) NULL,
	`series_title` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

DROP TABLE IF EXISTS `account_email_password_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `account_email_password_view` AS SELECT email, password FROM account ;

DROP TABLE IF EXISTS `account_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `account_junior_view` AS SELECT account_id, blocked_end_time, email_validated FROM account ;

DROP TABLE IF EXISTS `account_medior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `account_medior_view` AS SELECT account_id, blocked_end_time, first_name, last_name, email, email_validated FROM account ;

DROP TABLE IF EXISTS `definition_type_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `definition_type_view` AS SELECT * FROM definition_type ;

DROP TABLE IF EXISTS `episode_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `episode_view` AS SELECT * FROM episode ;

DROP TABLE IF EXISTS `episode_viewer_guide_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `episode_viewer_guide_view` AS SELECT * FROM episode_viewer_guide ;

DROP TABLE IF EXISTS `episode_watch_count_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `episode_watch_count_view` AS SELECT episode_id, SUM(watch_count) AS total_watch_count FROM progress WHERE episode_id != NULL GROUP BY episode_id ;

DROP TABLE IF EXISTS `genre_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `genre_view` AS SELECT * FROM genre ;

DROP TABLE IF EXISTS `language_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `language_junior_view` AS SELECT * FROM language ;

DROP TABLE IF EXISTS `movie_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `movie_junior_view` AS SELECT * FROM movie ;

DROP TABLE IF EXISTS `movie_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `movie_view` AS SELECT movie.movie_id, movie.title, movie.duration, movie.description, definition_type.name, genre.title AS genre, movie_viewer_guide_view.viewer_guides FROM movie LEFT JOIN definition_type ON movie.definition_type_id = definition_type.definition_type_id JOIN genre ON movie.genre_id = genre.genre_id JOIN movie_viewer_guide_view ON movie.movie_id = movie_viewer_guide_view.movie_id ;

DROP TABLE IF EXISTS `movie_viewer_guide_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `movie_viewer_guide_junior_view` AS SELECT * FROM movie_viewer_guide ;

DROP TABLE IF EXISTS `movie_viewer_guide_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `movie_viewer_guide_view` AS SELECT movie.movie_id, GROUP_CONCAT(viewer_guide.name ORDER BY viewer_guide.viewer_guide_id ASC) AS viewer_guides FROM movie JOIN movie_viewer_guide ON movie.movie_id = movie_viewer_guide.movie_id JOIN viewer_guide ON movie_viewer_guide.viewer_guide_id = viewer_guide.viewer_guide_id GROUP BY movie.movie_id ;

DROP TABLE IF EXISTS `movie_watch_count_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `movie_watch_count_view` AS SELECT movie_id, SUM(watch_count) AS total_watch_count FROM progress WHERE movie_id != NULL GROUP BY movie_id ;

DROP TABLE IF EXISTS `preference_genre_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `preference_genre_view` AS SELECT * FROM preference_genre ;

DROP TABLE IF EXISTS `preference_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `preference_view` AS SELECT * FROM preference ;

DROP TABLE IF EXISTS `preference_viewer_guide_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `preference_viewer_guide_view` AS SELECT * FROM preference_viewer_guide ;

DROP TABLE IF EXISTS `profile_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `profile_junior_view` AS SELECT * FROM profile ;

DROP TABLE IF EXISTS `progress_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `progress_view` AS SELECT * FROM progress ;

DROP TABLE IF EXISTS `season_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `season_view` AS SELECT * FROM season ;

DROP TABLE IF EXISTS `series_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `series_view` AS SELECT * FROM series ;

DROP TABLE IF EXISTS `subscription_definition_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `subscription_definition_view` AS SELECT subscription.subscription_id, definition_type.name FROM subscription JOIN definition_type ON subscription.definition_type = definition_type.definition_type_id ;

DROP TABLE IF EXISTS `subscription_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `subscription_junior_view` AS SELECT * FROM subscription ;

DROP TABLE IF EXISTS `subscription_record_junior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `subscription_record_junior_view` AS SELECT subscription_record_id, account_id FROM subscription_record ;

DROP TABLE IF EXISTS `subscription_record_medior_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `subscription_record_medior_view` AS SELECT subscription_record_id, account_id, start_date FROM subscription_record ;

DROP TABLE IF EXISTS `subtitle_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `subtitle_view` AS SELECT * FROM subtitle ;

DROP TABLE IF EXISTS `viewer_guide_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `viewer_guide_view` AS SELECT * FROM viewer_guide ;

DROP TABLE IF EXISTS `watchlist_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `watchlist_view` AS SELECT 
        `watchlist`.`watchlist_id` AS `watchlist_id`,
        `watchlist`.`profile_id` AS `profile_id`,
        `watchlist`.`movie_id` AS `movie_id`,
        `movie`.`title` AS `movie_title`,
        `watchlist`.`series_id` AS `series_id`,
        `series`.`name` AS `series_title`
    FROM
        ((`watchlist`
        LEFT JOIN `movie` ON (`watchlist`.`movie_id` = `movie`.`movie_id`))
        LEFT JOIN `series` ON (`watchlist`.`series_id` = `series`.`series_id`)) ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;