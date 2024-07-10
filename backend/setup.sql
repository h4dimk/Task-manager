CREATE DATABASE task_manager_db;
USE task_manager_db;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE,
    time TIME,
    image VARCHAR(255),
    priority ENUM('low', 'medium', 'high') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
