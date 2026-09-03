# TASK-TEST-001 — AI-EOS Collaboration Protocol Validation

**Status:** APPROVED · **Priority:** P1 · **Owner:** ChatGPT / Project Supervisor · **Target:** Gemini/Antigravity
**Task Type:** AI-EOS operational test
**Application changes:** Not permitted
**Production changes:** Not permitted

## Objective
Validate that a fresh Gemini/Antigravity session can discover and follow the SchoolSaaS AI-EOS collaboration protocol from the repository without relying on shared chat context.

## Mandatory reading
1. `AGENTS.md`
2. `.ai/AGENTS.md`
3. `.ai/00-GOVERNANCE/AI-COLLABORATION-PROTOCOL.md`
4. `.ai/00-GOVERNANCE/AI-ROLES.md`
5. `.ai/00-GOVERNANCE/AUTHORITY-MODEL.md`
6. `.ai/00-GOVERNANCE/ESCALATION-POLICY.md`
7. `.ai/05-WORKFLOW/CONTROL-STATE.yaml`
8. `.ai/05-WORKFLOW/TASK-QUEUE.md`
9. `.ai/05-WORKFLOW/RECOMMENDATIONS.md`
10. `.ai/05-WORKFLOW/messages/README.md`

## Required behavior
- Begin with read-only inspection.
- Determine the authority hierarchy and collaboration protocol from repository evidence.
- Verify how an authoritative ChatGPT instruction is identified.
- Assess task lifecycle, recommendation workflow, blocker/escalation workflow and review workflow.
- Perform a documentation/governance health check for stale or contradictory references, especially stale Codex authority references.
- Produce at least one genuine, evidence-based technical recommendation using the repository's recommendation protocol. Do not implement it.
- Produce the required implementation/test report.
- If the protocol is ambiguous or contradictory, report it rather than guessing or silently changing governance.

## Explicit boundaries
Do not modify application code, database/schema, migrations, RLS, authentication, authorization, dependencies, infrastructure, deployment configuration, environment configuration, credentials or production state. Do not modify the AI-EOS governance protocol itself during this test. Do not merge a PR.

## Acceptance criteria
- **AC-001:** Correctly identifies Human as final authority.
- **AC-002:** Correctly identifies ChatGPT as Chief Software Architect, Project Supervisor, UI/UX Reviewer, Security Analyst, QA Lead and Technical Strategy Advisor.
- **AC-003:** Correctly identifies Gemini/Antigravity as Implementation Engineer & Technical Contributor with implementation, investigation, recommendation and blocker authority within approved scope.
- **AC-004:** Explains how authoritative ChatGPT instructions are recognized using control state/message metadata.
- **AC-005:** Demonstrates understanding that recommendations are not authorization and that material decisions may require ChatGPT/human disposition.
- **AC-006:** Demonstrates the blocker/escalation mechanism.
- **AC-007:** Produces an evidence-based recommendation with a REC-#### identifier and no implementation.
- **AC-008:** Produces an implementation/test report and identifies changed files.
- **AC-009:** Makes no application or production changes.
- **AC-010:** Creates the appropriate branch/PR only if required by the protocol; does not merge.

## Required report
Record: repository/governance files inspected; authority model; authoritative-instruction handshake; task lifecycle; recommendation protocol; blocker protocol; documentation findings; usability assessment; recommendation(s); blockers; files changed; tests/checks; final pass/partial/fail assessment.

## Expected completion state
`IMPLEMENTED` → ChatGPT review → `APPROVED` or `CHANGES_REQUESTED`. Human remains final authority for merge/release.
