# SchoolSaaS AI Engineering Operating System (AI-EOS)

This directory is the durable engineering memory and governance layer for SchoolSaaS. It is provider-independent and supersedes the old Codex Collaboration Playbook model.

## Authority
Human Project Owner → ChatGPT (Chief Software Architect / Project Supervisor) → approved task → Gemini/Antigravity (Implementation Engineer) → GitHub → ChatGPT review → human merge/release decision.

## Source of truth
The actual repository implementation and Git history are authoritative. `.ai/` records decisions, constraints, tasks, risks and reviews; it does not override code reality.

## Start here
1. `AGENTS.md`
2. `00-GOVERNANCE/AI-GOVERNANCE.md`
3. `01-PROJECT/PROJECT-CONTEXT.md`
4. `02-ARCHITECTURE/ARCHITECTURE.md`
5. `04-SECURITY/SECURITY-POLICY.md`
6. `05-WORKFLOW/TASK-QUEUE.md`
7. Active task + linked review/risk/ADR records.

## Canonical structure
Each governance topic has one active canonical record under the numbered AI-EOS directories. Historical records are explicitly marked as legacy/reference and must not override active governance.

## Security posture
The repository carries open critical/high findings. Do not begin remediation implicitly; use an approved task, required security review, safe test environment and human approval for privileged, database, RLS, credential or destructive operations.

Do not create new competing top-level policy files.
