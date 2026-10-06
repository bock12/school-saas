# Testing Standards

Security-sensitive changes require negative tests for:
- unauthenticated callers;
- authenticated callers with wrong roles;
- correct role in the wrong tenant;
- correct tenant with wrong object/relationship;
- malformed or unauthorized identifiers;
- privileged/service-role boundary behavior.

RLS proof must use non-service-role principals and distinct tenants. Record exact commands and results. A green UI test is not evidence of tenant isolation.
