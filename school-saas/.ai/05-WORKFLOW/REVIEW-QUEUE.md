# Review Queue

Verdicts: `APPROVED` / `CHANGES_REQUESTED` / `BLOCKED`.

## Review lifecycle
Implementer records evidence; ChatGPT reviews acceptance criteria, scope, architecture, quality, security, tenant/RLS impact and Definition of Done; findings receive severity/action/verification; implementer responds; ChatGPT records the review verdict; human makes the final merge/release decision. A reviewer never self-approves implementation. Critical/high security findings block approval unless explicitly accepted by human.

## REVIEW-GOV-0001 — Governance setup
**Task:** GOV-0001  
**Reviewer:** Human Project Owner  
**Status:** OPEN  
**Priority:** Medium

### Scope
Confirm canonical `.ai` records, authority boundaries, security gates and roadmap fit the intended operating model.

### Required human decision
Accept/revise the AI-EOS authority migration and canonical structure. No application changes are implied.

### Final decision
Pending human review.

## REVIEW-TASK-TEST-001 — AI-EOS Protocol Validation Review
**Task:** TASK-TEST-001  
**Reviewer:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Status:** OPEN  
**Priority:** P1  

### Scope
Verify Gemini/Antigravity implementation report for TASK-TEST-001 against acceptance criteria AC-001 through AC-010:
- Confirmation of Human final authority and ChatGPT supervisory authority.
- Confirmation of authoritative task handshake via `CONTROL-STATE.yaml` and `MSG-TEST-001`.
- Assessment of repository/governance documentation health.
- Evaluation of recommendation `REC-0001` (module-level `createAdminClient()`).
- Verification that no application code, schema, migrations, RLS, dependencies, or production state were altered.
- Verification that no merge was performed.

### Required supervisor decision
Evaluate implementation report and issue verdict (`APPROVED` / `CHANGES_REQUESTED`). Record disposition on `REC-0001`.

### Final decision
Pending ChatGPT review.

## Review rules
Every review links the task, implementation report, ADRs, risks and security records as applicable. Security blockers include missing auth boundaries, missing tenant checks, privileged database access without justification, RLS weakening, secret exposure, destructive migrations without approval, and missing cross-tenant/role regression tests.
