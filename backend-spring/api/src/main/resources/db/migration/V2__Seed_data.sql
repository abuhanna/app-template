-- Insert default department
INSERT INTO departments (id, code, name, description, is_active, created_at, created_by)
VALUES (
    1,
    'IT',
    'Information Technology',
    'IT Department',
    TRUE,
    CURRENT_TIMESTAMP,
    'system'
) ON CONFLICT (code) DO NOTHING;

-- Insert admin user (password: Admin@123)
-- BCrypt hash for "Admin@123" (Cost 11)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department_id, is_active, created_at, created_by)
VALUES (
    1,
    'admin',
    'admin@apptemplate.local',
    '$2a$11$dpNSxRznUDsAV3grMSznjuOe4TphFyYJsCVLU.AaBwgx0DT9f6c8O',
    'System',
    'Administrator',
    'ADMIN',
    1,
    TRUE,
    CURRENT_TIMESTAMP,
    'system'
) ON CONFLICT (username) DO NOTHING;
