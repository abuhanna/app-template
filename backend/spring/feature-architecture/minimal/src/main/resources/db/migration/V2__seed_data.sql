-- ============================================================================
-- V2: Seed data for AppTemplate (Spring Boot Feature Architecture - Minimal)
-- ============================================================================

-- Seed Admin user (no password — auth is external)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@apptemplate.com',
    '',
    'Admin',
    'User',
    'admin',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;
