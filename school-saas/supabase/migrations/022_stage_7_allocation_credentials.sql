-- Migration 022: Add Stage 7 Class Allocation & Login Provisioning columns to applicants table

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS class_arm TEXT,
ADD COLUMN IF NOT EXISTS student_id_number TEXT,
ADD COLUMN IF NOT EXISTS student_username TEXT,
ADD COLUMN IF NOT EXISTS student_password_temp TEXT,
ADD COLUMN IF NOT EXISTS parent_username TEXT,
ADD COLUMN IF NOT EXISTS parent_password_temp TEXT,
ADD COLUMN IF NOT EXISTS account_provisioned BOOLEAN DEFAULT FALSE;
