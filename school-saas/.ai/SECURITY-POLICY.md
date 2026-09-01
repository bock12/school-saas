# SECURITY_POLICY.md

## Mandatory security rules

Never:
- Commit API keys, passwords, private keys, service-role keys, or tokens.
- Put secrets in client-side code.
- Trust client-supplied authorization claims without server-side verification.
- Disable authentication/RLS to solve development problems.
- Log sensitive personal information unnecessarily.

## Authorization

Every protected operation must enforce authorization on the trusted server/data layer.

For multi-tenant data:
- Verify tenant membership.
- Prevent cross-tenant reads and writes.
- Review database policies for every new sensitive table.

## Input security

Validate:
- IDs
- Query parameters
- Form fields
- File uploads
- Pagination
- Sort/filter values

Use parameterized queries and safe ORM/database APIs.

## Files/uploads

Validate type, size, ownership, and access permissions.

## Security review triggers

Require an explicit review for:
- Authentication
- Authorization
- RLS
- Payments
- Student/parent data
- File access
- Admin privileges
- Secrets
- Database migrations
- External integrations
