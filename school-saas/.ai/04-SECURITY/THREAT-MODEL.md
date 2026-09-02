# Threat Model

Priority threats:
1. Credential exposure
2. Cross-tenant access
3. Broken access control / IDOR
4. Privilege escalation
5. Unauthenticated PII APIs
6. Service-role misuse
7. Direct PostgreSQL/auth.users abuse
8. Weak RLS
9. Session/token compromise
10. Export abuse
11. Sensitive log leakage
12. Public provisioning abuse

For each remediation, identify actor, asset, trust boundary, attack precondition, impact, control and regression test.
