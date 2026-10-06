# Target Architecture

`request → authenticated actor → canonical tenant context → permission check → object/relationship check → validated operation → database`

## Invariants
- Tenant identity comes from a trusted server/data path and fails closed when absent or unmatched.
- Service-role access is a reviewed exception, never a substitute for authorization.
- Direct PostgreSQL and `auth.users` operations are isolated to narrow privileged boundaries.
- RLS and application authorization reinforce each other.
- Public routes are explicit and data-minimized.
- Schema, RLS, authorization, constraints/indexes and rollback planning are reviewed as one design unit.
