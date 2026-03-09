-- ============================================================================
-- V2: Seed data for AppTemplate (Spring Boot N-Layer Architecture - Minimal)
-- ============================================================================

-- Seed Admin user (password: Admin@123)
-- BCrypt hash of Admin@123
INSERT INTO users (username, email, password_hash, name, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@apptemplate.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'ADMIN',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;
