CREATE DATABASE IF NOT EXISTS faculty_ledger
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE faculty_ledger;

CREATE TABLE IF NOT EXISTS auth_user (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    api_token_hash VARCHAR(255) DEFAULT NULL,
    api_token_expires_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY auth_user_email_unique (email),
    KEY auth_user_api_token_hash_index (api_token_hash)
);

CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    university_name VARCHAR(150) NOT NULL,
    gender VARCHAR(30) NOT NULL,
    year_joined SMALLINT UNSIGNED NOT NULL,
    department VARCHAR(100) NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY teachers_user_id_unique (user_id),
    UNIQUE KEY teachers_employee_code_unique (employee_code),
    CONSTRAINT teachers_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
