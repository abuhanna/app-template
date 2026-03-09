-- ============================================================================
-- V2: Seed data for AppTemplate (Spring Boot Clean Architecture - Full)
-- ============================================================================

-- Seed General Department
INSERT INTO departments (code, name, description, is_active, created_at, updated_at)
VALUES ('GEN', 'General', 'Default department', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Seed Admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@apptemplate.com',
    '$2a$10$C04v74b5bo/6cIwCn1ApVusaAGh5zXJ9MfMtVSarowTmIfCJwLEuO',
    'Admin',
    'User',
    'ADMIN',
    (SELECT id FROM departments WHERE code = 'GEN'),
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- Seed Sample user (password: User@123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id, is_active, created_at, updated_at)
VALUES (
    'johndoe',
    'user@apptemplate.com',
    '$2a$10$rZLOSzcWxNbcCL7a27NkmeRIkgqXFCB6i.szavtiEod5asNNruYcu',
    'John',
    'Doe',
    'USER',
    (SELECT id FROM departments WHERE code = 'GEN'),
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;
