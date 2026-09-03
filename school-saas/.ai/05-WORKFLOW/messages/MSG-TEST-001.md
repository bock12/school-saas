# MSG-TEST-001 — TASK-TEST-001 Authorization

```yaml
message_id: MSG-TEST-001
from: chatgpt
to: gemini
type: AUTHORIZED_TASK
task_id: TASK-TEST-001
status: ACTIVE
issued_at: 2026-09-03

instruction: Start TASK-TEST-001 according to the AI-EOS protocol.

constraints:
  - Read the repository governance/protocol before substantive work.
  - No application-code, database, RLS, auth, dependency, infrastructure or production changes.
  - Do not modify AI-EOS governance rules during the test.
  - Recommendations are encouraged but are not authorization.
  - Report blockers instead of silently crossing authority boundaries.
  - Do not merge the resulting PR.
```

This message is the durable authorization record for TASK-TEST-001. The task specification is `.ai/05-WORKFLOW/TASK-TEST-001.md`.