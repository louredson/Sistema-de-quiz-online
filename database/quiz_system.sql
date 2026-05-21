CREATE DATABASE IF NOT EXISTS quiz_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiz_system;

DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_options;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'Geral',
  created_by INT NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  score INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@quiz.com', '$2y$12$d73BZKaH/PPKoRyEk7Utyei2vMNGtCmoUlo4ick8Epp4lPOagpllq', 'admin'),
('Utilizador Demo', 'user@quiz.com', '$2y$12$1AS9fMkStZ4bQyd3MDH0BOx.DwWRCS5AO6XAMYw26w7jYUTwob36y', 'user');

INSERT INTO quizzes (title, description, category, created_by, status) VALUES
('Conhecimentos Gerais', 'Quiz de demonstração com perguntas simples.', 'Geral', 1, 'published');

INSERT INTO quiz_questions (quiz_id, question_text) VALUES
(1, 'Qual e a capital de Angola?'),
(1, 'Quanto e 5 x 6?');

INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES
(1, 'Luanda', 1),
(1, 'Benguela', 0),
(1, 'Huambo', 0),
(1, 'Malanje', 0),
(2, '30', 1),
(2, '25', 0),
(2, '35', 0),
(2, '40', 0);

INSERT INTO quiz_attempts (quiz_id, user_id, total_questions, correct_answers, score) VALUES
(1, 2, 2, 2, 100),
(1, 1, 2, 1, 50);
