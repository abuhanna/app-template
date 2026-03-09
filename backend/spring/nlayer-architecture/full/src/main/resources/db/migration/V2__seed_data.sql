-- ============================================================================
-- V2: Seed data for AppTemplate (Spring Boot N-Layer Architecture - Full)
-- ============================================================================

-- Seed IT Department
INSERT INTO departments (code, name, description, is_active, created_at, updated_at)
VALUES ('IT', 'IT Department', 'Information Technology Department', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Seed Admin user (password: Admin@123)
-- BCrypt hash of Admin@123
INSERT INTO users (username, email, password_hash, name, role, department_id, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@apptemplate.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'ADMIN',
    (SELECT id FROM departments WHERE code = 'IT'),
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;
