-- Add password_history column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_history TEXT;
