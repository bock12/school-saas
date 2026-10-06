# Security Policy and Review Protocol

## Mandatory rules
- Never commit/report credentials, tokens, service-role keys, passwords, private keys, production dumps, or unnecessary personal data.
- Never put secrets or service-role clients in browser code; do not use fallbacks that hide configuration errors.
- Never disable/bypass authentication, authorization, tenant checks, or RLS to unblock work.
- Use trusted server-side authorization, validated inputs, safe database APIs, and minimum necessary disclosure.
- Treat student, parent, staff, health, disciplinary, finance, attendance, assessment, identity and communication data as sensitive.

## Tenant and privilege protocol
For every protected operation verify actor/roles; trusted tenant source; direct membership, organization-parent and super-admin exceptions; RLS/application authorization; object/file ownership; audit event; and safe error behavior.

`createAdminClient()` bypasses RLS. Every use requires trusted local authorization before the call, a task security note, and ChatGPT architecture/security review. New service-role use is high-risk by default.

## Security review
Security review is mandatory for auth, sessions, permissions, tenant routing, RLS, service-role access, migrations, public APIs, storage/files, payments, imports/exports, external/AI integrations, sensitive data and logging.

Critical/high findings block approval until fixed or expressly accepted by a human. Security records are sanitized: never include exploit instructions, secrets, live-system detail or personal data. Prove cross-tenant/role denial with distinct tenant principals; a service-role client is never evidence that RLS works.

| Severity | Required response |
|---|---|
| Critical | Stop work, limit sensitive disclosure, notify human immediately. |
| High | Block merge pending remediation or documented human exception. |
| Medium | Track owner and milestone. |
| Low | Track hygiene/hardening as useful. |
