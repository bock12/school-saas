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

No risk is considered closed solely because a UI path is inaccessible; closure requires evidence at the relevant server/data boundary.
