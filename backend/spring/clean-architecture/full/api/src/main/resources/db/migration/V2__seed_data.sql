-- ============================================================================
-- V2: Seed data for AppTemplate (Spring Boot Clean Architecture - Full)
-- ============================================================================

-- Seed General Department
INSERT INTO departments (code, name, description, is_active, created_by)
VALUES ('GEN', 'General', 'Default department', true, 'system')
ON CONFLICT (code) DO NOTHING;

-- Seed Admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id, is_active, created_by)
VALUES (
    'admin',
    'admin@apptemplate.com',
    '$2a$10$C04v74b5bo/6cIwCn1ApVusaAGh5zXJ9MfMtVSarowTmIfCJwLEuO',
    'Admin',
    'User',
    'admin',
    (SELECT id FROM departments WHERE code = 'GEN'),
    true,
    'system'
)
ON CONFLICT (username) DO NOTHING;

-- Seed Sample user (password: User@123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id, is_active, created_by)
VALUES (
    'johndoe',
    'user@apptemplate.com',
    '$2a$10$rZLOSzcWxNbcCL7a27NkmeRIkgqXFCB6i.szavtiEod5asNNruYcu',
    'John',
    'Doe',
    'user',
    (SELECT id FROM departments WHERE code = 'GEN'),
    true,
    'system'
)
ON CONFLICT (username) DO NOTHING;
