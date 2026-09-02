# Review Queue

## Review lifecycle

Implementer records evidence; Codex checks acceptance criteria, scope, architecture, quality, security, tenant/RLS impact, and Definition of Done; findings receive severity/action/verification; implementer responds; Codex records `APPROVED_FOR_MERGE` or `CHANGES_REQUESTED`; human makes final merge/release decision. A reviewer never self-approves implementation. Critical/high security findings block approval unless explicitly accepted by human.

## REVIEW-GOV-0001 - Governance setup

**Task:** GOV-0001

**Reviewer:** Human developer

**Status:** OPEN

**Priority:** Medium

### Scope

Confirm canonical `.ai` records, authority boundaries, security gates, and roadmap fit the intended operating model.

### Required human decisions

- Accept/revise ADR-0001 on canonical underscore naming and legacy treatment.
- Approve/reprioritize `TASK-0001` as the next technical task.

### Final decision

Pending human review.
