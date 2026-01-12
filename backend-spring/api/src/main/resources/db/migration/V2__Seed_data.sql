-- Insert default department
INSERT INTO departments (id, code, name, description, is_active, created_at, created_by)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'IT',
    'Information Technology',
    'IT Department',
    TRUE,
    CURRENT_TIMESTAMP,
    'system'
) ON CONFLICT (code) DO NOTHING;

-- Insert admin user (password: Admin@123)
-- BCrypt hash for "Admin@123"
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department_id, is_active, created_at, created_by)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin',
    'admin@apptemplate.local',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.z3A3r5B7z3.YIe',
    'System',
    'Administrator',
    'ADMIN',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    TRUE,
    CURRENT_TIMESTAMP,
    'system'
) ON CONFLICT (username) DO NOTHING;
