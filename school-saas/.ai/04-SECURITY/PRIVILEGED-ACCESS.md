# Privileged Access Policy

`createAdminClient()` bypasses RLS. Direct PostgreSQL and `auth.users` administration are privileged boundaries.

Every privileged call must establish before the operation:
1. authenticated actor;
2. required role/permission;
3. trusted tenant scope;
4. target object/relationship authorization;
5. validated input;
6. least-privilege justification;
7. auditability where material;
8. negative tests.

No new privileged caller is approved without architecture/security review.
