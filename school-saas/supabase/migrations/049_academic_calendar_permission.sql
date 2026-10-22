-- Migration 049: Dedicated academic calendar event-management permission.
-- This permission is enforced by the canonical application authorization engine.
-- Scope is school-level, with platform/org scopes permitted by the canonical registry.

INSERT INTO public.permissions_catalog
  (permission_key, module, resource, action, description, scope, status)
VALUES
  ('calendar.events.manage', 'calendar', 'events', 'manage',
   'Create, update, and delete academic calendar events', 'school', 'active')
ON CONFLICT (permission_key) DO UPDATE
SET module = EXCLUDED.module,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    description = EXCLUDED.description,
    scope = EXCLUDED.scope,
    status = 'active',
    updated_at = now();
