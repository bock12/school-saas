# Risk Register

| ID | Severity | Risk | Status |
|---|---|---|---|
| R-001 | Critical | Embedded database credentials in tracked scripts | Open |
| R-002 | Critical | Unauthenticated privileged APIs | Open |
| R-003 | Critical | Privileged server actions without operation authorization | Open |
| R-004 | High | Unsafe/arbitrary tenant resolution fallback | Open |
| R-005 | High | Examination RLS `USING (true)` | Open |
| R-006 | High | Notification RLS/service-role boundary incomplete | Open |
| R-007 | High | Role-model drift | Open |
| R-008 | High | Authorization/RLS negative-test coverage not evidenced | Open |
| R-009 | High | Prototype routes may be treated as production-ready | Open |
| R-010 | High | Migration ordering/execution is unreliable | Open |
| R-011 | Medium | Release confidence constrained by build capacity and missing CI/tests | Open |
| R-012 | Medium | Sensitive-data retention/export/audit controls incomplete | Open |

## Historical evidence
The 2026-09-01 static audit established the evidence behind the critical/high risks above. Earlier risk identifiers were normalized during AI-EOS migration; the historical audit remains preserved separately.

No risk is considered closed solely because a UI path is inaccessible; closure requires evidence at the relevant server/data boundary.
