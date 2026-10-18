-- RUN THIS IF YOU HAVEN'T MAKE THE DB YET

CREATE DATABASE IF NOT EXISTS lab5 CHARACTER SET utf8mb4;
USE lab5;

-- Table

CREATE TABLE IF NOT EXISTS patient (
  patientid   INT(11)      NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  dateOfBirth DATETIME     NOT NULL,
  PRIMARY KEY (patientid)
) ENGINE=InnoDB; -- The thing we need for some reason

-- Users

CREATE USER IF NOT EXISTS 'lab5_admin'@'localhost' IDENTIFIED BY 'change_me_admin';
GRANT CREATE ON lab5.* TO 'lab5_admin'@'localhost';

CREATE USER IF NOT EXISTS 'lab5_restricted'@'localhost' IDENTIFIED BY 'change_me_restricted';
GRANT SELECT, INSERT ON lab5.* TO 'lab5_restricted'@'localhost';

FLUSH PRIVILEGES;
