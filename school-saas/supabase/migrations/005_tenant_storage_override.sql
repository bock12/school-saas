-- Migration: Add max_storage_gb to tenants table for usage overrides
-- Run this in the Supabase SQL Editor or via supabase db push

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS max_storage_gb INTEGER DEFAULT 5;
