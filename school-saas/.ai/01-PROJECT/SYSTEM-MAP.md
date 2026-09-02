# Verified System Map

```text
Browser
  ↓
Next.js middleware
  ├─ Supabase session refresh
  ├─ host/subdomain tenant routing
  └─ protected-route handling
  ↓
Next.js pages / API routes / server actions
  ├─ normal Supabase client → RLS
  ├─ service-role client → RLS bypass
  └─ direct PostgreSQL → privileged boundary
  ↓
Supabase / PostgreSQL
  ├─ tenant data
  ├─ platform/super-admin data
  └─ RLS/security-definer controls
```

APIs are excluded from middleware matching, so each handler must establish its own authentication, authorization, tenant scope, validation and safe response behavior.
