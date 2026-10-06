# Tenant Isolation

Canonical authorization path:

`trusted actor → trusted tenant membership → target tenant → target object → operation`

Reject missing/unmatched tenant context and arbitrary fallback tenants. Caller-supplied tenant IDs/slugs must be verified against trusted membership and organization-child rules.

Required regression: Tenant A must be unable to read/create/update/delete Tenant B resources through pages, APIs, server actions, exports, communications, reports or files. RLS tests must use non-service-role principals.
