# SchoolSaaS AI Engineering Governance

## Authority

Human Project Owner → ChatGPT (Chief Software Architect / Project Supervisor) → approved task → Gemini/Antigravity (Implementation Engineer) → GitHub → ChatGPT review → human merge/release decision.

Human authority is final for production, merge/release, credentials, destructive operations, migration execution, new dependencies, and architecture/schema/RLS exceptions.

## Rules
- Evidence before architecture claims.
- Task ID before implementation.
- No self-approval.
- Security and tenant boundaries are non-negotiable.
- No secrets in source or `.ai/`.
- Application/database changes require an approved task.
- Material architecture changes require an ADR.
- Critical/high security findings block approval unless a human explicitly accepts the risk.
- Three-tier branching: Routine `.ai` control-plane updates do not require dedicated branches; material governance changes use governance branches and PRs; product/application changes require feature/fix branches and PRs. Branches represent meaningful change sets, not individual AI conversations.

## Evidence labels
CONFIRMED, DOCUMENTED, INFERRED, POTENTIAL, NOT VERIFIED, CONFLICT.

## Lifecycle
`BACKLOG → TRIAGED → APPROVED → IN_PROGRESS → IMPLEMENTED → UNDER_REVIEW → APPROVED_FOR_MERGE → COMPLETED`

`BLOCKED`, `CHANGES_REQUESTED`, `CANCELLED`, and `SUPERSEDED` are allowed states.
