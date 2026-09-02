# Module Security Control Matrix

| Module | Authentication | RBAC | Tenant isolation | RLS | Privileged access | Negative tests |
|---|---|---|---|---|---|---|
| Admissions | Required except explicitly public intake | Required for management | Required | Verify | Critical review | Required |
| Exams | Required | Exam-role boundaries | Required | Remediate/verify | Critical review | Required |
| Attendance | Required | Teacher/admin rules | Required | Verify | Review | Required |
| Finance | Required | Finance/admin rules | Required | Verify | Review | Required |
| Communication | Required | Sender/admin rules | Required | Verify | Critical review | Required |
| Students | Required | Role-specific | Required | Verify | Review | Required |
| Platform/tenant provisioning | Required except explicit public onboarding | Super-admin/admin rules | Required | Verify | Critical review | Required |
| Reports/exports | Required | Data-access role | Required | Verify | Critical review | Required |

A route being hidden in the UI is never sufficient evidence for a security control. Each module must prove authorization at the server/data boundary.
