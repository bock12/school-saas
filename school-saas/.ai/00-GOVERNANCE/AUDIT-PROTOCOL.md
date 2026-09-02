# Architecture & Security Audit Protocol

Inspect, in order:
1. Repository topology and runtime/build configuration.
2. Entry points, middleware and route boundaries.
3. Authentication/session flow.
4. Authorization/RBAC and operation-level checks.
5. Tenant resolution and isolation.
6. API routes/server actions and public/private exposure.
7. Supabase clients, service-role callers, direct PostgreSQL and `auth.users` access.
8. Database schema, RLS policies and security-definer functions.
9. Storage/files and sensitive-data exposure.
10. Tests, CI and release gates.
11. Secrets and operational scripts.
12. Documentation drift.

Every finding records evidence, classification, severity, impact, remediation, confidence and required verification. Static review must clearly distinguish confirmed source behavior from runtime-dependent reachability/exploitability.
