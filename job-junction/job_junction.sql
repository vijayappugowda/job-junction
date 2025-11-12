-- ==============================================
-- Job Junction Database Schema (Apna-style)
-- ==============================================

-- Drop existing DB if you want a fresh start
DROP DATABASE IF EXISTS job_junction;

-- Create new database
CREATE DATABASE job_junction;
USE job_junction;

-- ==============================================
-- USERS TABLE (Job Seekers)
-- ==============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- EMPLOYERS TABLE (For Hiring)
-- ==============================================
CREATE TABLE employers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    company VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- JOBS TABLE (Posted by Employers)
-- ==============================================
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- APPLICATIONS TABLE (Job Applications)
-- ==============================================
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- ==============================================
-- SAMPLE DATA — USERS
-- ==============================================
INSERT INTO users (name, email, password, profile_image)
VALUES
('Vijay Kumar', 'vijay@example.com', '2002', '/uploads/sample-user.png'),
('Priya Sharma', 'priya@example.com', '1234', '/uploads/sample-user2.png');

-- ==============================================
-- SAMPLE DATA — EMPLOYERS
-- ==============================================
INSERT INTO employers (name, email, password, company)
VALUES
('HR Shalini', 'shalini@zenusgroup.com', 'admin123', 'Zenus Group'),
('Rajesh Nair', 'rajesh@techwave.in', 'hire2025', 'TechWave');

-- ==============================================
-- SAMPLE DATA — JOBS
-- ==============================================
INSERT INTO jobs (title, company, location, description)
VALUES
('Python Developer', 'Zenus Group', 'Bangalore', 'Looking for fresher Python developers with good understanding of OOP and APIs.'),
('Frontend Engineer', 'TechWave', 'Chennai', 'Work with HTML, CSS, and JavaScript to build interactive web apps.'),
('Data Analyst', 'InfoTech', 'Hyderabad', 'Analyze large datasets, create dashboards using Power BI and SQL.'),
('Backend Node.js Developer', 'NextGen Labs', 'Pune', 'Develop REST APIs, integrate MySQL, and deploy on cloud environments.');

-- ==============================================
-- SAMPLE DATA — APPLICATIONS
-- ==============================================
INSERT INTO applications (user_id, job_id)
VALUES
(1, 1),
(1, 2),
(2, 3);

-- ==============================================
-- CHECK EVERYTHING
-- ==============================================
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM employers;
SELECT * FROM jobs;
SELECT * FROM applications;
