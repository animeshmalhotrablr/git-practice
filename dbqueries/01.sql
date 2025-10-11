-- Table for Authorization/User Roles
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    roles VARCHAR(255) NOT NULL, -- e.g., 'admin,user:read,user:write'
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example data:
INSERT INTO users (email, roles, name) VALUES
('testuser@gmail.com', 'user:read,data:read', 'Test User'),
('adminuser@gmail.com', 'admin,user:write,data:write', 'Admin User');

-- Table for Login Events
CREATE TABLE login_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Table for Audit Logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(255),
    action_type VARCHAR(50) NOT NULL, -- e.g., 'POST', 'GET'
    endpoint VARCHAR(255) NOT NULL,
    status_code INT
);