-- Migration 018: Add source field to applicants table
-- Distinguishes between 'online' (public portal) and 'admin' (manual entry) applications

ALTER TABLE applicants ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'online' NOT NULL;

-- Update any existing applicants that have no source set
UPDATE applicants SET source = 'online' WHERE source IS NULL;
