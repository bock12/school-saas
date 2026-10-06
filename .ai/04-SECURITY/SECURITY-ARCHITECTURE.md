# Security Architecture Baseline

## Critical findings carried from the read-only audit
- **SEC-005:** eleven tracked migration-runner scripts contain embedded database credentials. Treat as a credential-exposure incident; values are intentionally not reproduced.
- **SEC-006:** unauthenticated privileged APIs expose sensitive admissions, exam, CASS-export and super-admin lead operations through privileged access.
- **SEC-009:** several exported server actions perform privileged service-role/direct PostgreSQL/auth-admin operations without operation-boundary authorization.

## High findings
- **SEC-010:** academic session/calendar tenant resolution has `SELECT id FROM tenants LIMIT 1` fallback and other actions accept tenant identifiers without consistent membership authorization.
- **SEC-011:** examination RLS policies use broad `FOR ALL USING (true)` predicates.
- **SEC-012:** notification RLS/service-role boundary needs policy and caller verification.
- **SEC-013:** role-model definitions require canonicalization.

## Positive controls
Server-only admin client; key validation; Supabase SSR; layered tenant routing; RLS foundation; protected hierarchy in `users.ts`.

Runtime exploitability, production grants/configuration, and executed RLS behavior remain NOT VERIFIED by the static audit.
