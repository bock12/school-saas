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
**Status:** CHANGES_REQUESTED  
**Priority:** P1  

### Scope
Verify Gemini/Antigravity implementation report for TASK-TEST-001 against acceptance criteria AC-001 through AC-010:
- Confirmation of Human final authority and ChatGPT supervisory authority.
- Confirmation of authoritative task handshake via `CONTROL-STATE.yaml` and `MSG-TEST-001`.
- Assessment of repository/governance documentation health.
- Evaluation of recommendation `REC-0001` (module-level `createAdminClient()`).
- Verification that no application code, schema, migrations, RLS, dependencies, or production state were altered.
- Verification that no merge was performed.

### ChatGPT Review Findings

**Overall:** The collaboration-protocol test passed its core objective, but the submitted recommendation and evidence terminology require correction before approval.

**Finding 1 — REC-0001 remediation is incomplete:** Moving `createAdminClient()` into a handler does not itself provide authorization. The recommendation must separately define authentication, tenant resolution/authorization, role/permission authorization, resource scope checks, and privileged-client usage only after the required authorization boundary.

**Finding 2 — Examination API security finding must remain explicit:** The apparent lack of request-level authentication, authorization, and tenant scoping in `src/app/api/admin/exams/route.ts` is a distinct security concern and must not be reduced to a client-instantiation-scope issue.

**Finding 3 — Tenant-resolution risk:** The `academic-calendar.ts` tenant-resolution behavior must be evaluated separately. A privileged operation must never silently select an unrelated/default tenant when the caller tenant cannot be established.

**Finding 4 — QA evidence terminology:** Git status, branch inspection, and static repository inspection are validation activities, not automated application tests. The report must distinguish governance validation, static analysis, automated application tests, and runtime/integration tests.

**Finding 5 — Lifecycle clarity:** Gemini may record that implementation is complete and ChatGPT review is pending, but must not imply that ChatGPT has approved the work. The workflow should preserve a clear distinction between implementation completion and supervisory approval.

### Required supervisor decision
Disposition: `CHANGES_REQUESTED`.

See durable review message `MSG-TEST-003` for the authoritative correction instructions.

### Recommendation disposition
`REC-0001`: `ACCEPTED_WITH_CHANGES` for continued refinement only; this disposition does **not** authorize application implementation. Any resulting application work must be converted into a separate authorized task.

### Final decision
Pending second ChatGPT review after Gemini corrections.

## Review rules
Every review links the task, implementation report, ADRs, risks and security records as applicable. Security blockers include missing auth boundaries, missing tenant checks, privileged database access without justification, RLS weakening, secret exposure, destructive migrations without approval, and missing cross-tenant/role regression tests.
