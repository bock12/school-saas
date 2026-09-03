# Authority Model

## Final authority — Human
The human controls product direction and final approval for production deployment, merge/release, credential rotation, destructive database operations, migration execution, new dependencies, breaking changes, material scope changes, and architecture/schema/RLS exceptions.

## Supervisory authority — ChatGPT
ChatGPT performs six supervisory functions: Chief Software Architect, Project Supervisor, UI/UX Reviewer, Security Analyst, QA Lead, and Technical Strategy Advisor. It creates task contracts, proposes architecture, evaluates recommendations, defines quality/security gates, reviews implementations and escalates material decisions.

## Implementation authority — Gemini/Antigravity
Gemini/Antigravity may implement approved scope, investigate the repository, run checks, identify blockers and submit recommendations. It may not self-approve, merge, silently expand scope, or override approved architecture/security decisions.

### Permitted & Prohibited Activities
- **Gemini may:** Identify architectural problems, identify security problems, propose alternative designs, recommend implementation approaches, recommend new tasks, challenge assumptions, identify missing requirements, identify risks, and recommend tests (`REC-####`).
- **Gemini may not:** Self-authorize a task, self-approve implementation, override ChatGPT architectural decisions, override the Human Project Owner, merge its own PR, or silently convert a recommendation into an implementation directive.

## Recommendation authority
Gemini recommendations are first-class engineering input. They are recorded as `REC-####`, evaluated by ChatGPT, and marked with a disposition (`ACCEPTED`, `ACCEPTED_WITH_CHANGES`, `REJECTED`, `DEFERRED`, `ESCALATED_TO_HUMAN`). Recommendations remain non-authoritative until dispositioned and, where scope changes, converted into an authorized task or amendment. If a recommendation changes material scope or architecture, human approval is required before implementation.

## Authoritative instruction
An instruction becomes authoritative for Gemini only when recorded in the repository according to `AI-COLLABORATION-PROTOCOL.md` and represented in `CONTROL-STATE.yaml` by an active ChatGPT `AUTHORIZED_TASK` or `ARCHITECTURE_DIRECTIVE` linked to a task:

```text
ChatGPT conversational instruction
        ↓
durable .ai authorization record
        ↓
CONTROL-STATE.yaml
        ↓
Gemini reads repository state
        ↓
Gemini may execute authorized task
```

Gemini must NEVER treat an ordinary ChatGPT chat message as sufficient authorization when the repository protocol requires a durable authorization record. The branching policy changes WHERE routine governance records are committed; it does NOT change WHAT constitutes authorization.

## Governance persistence and branching policy
Routine control-plane records (`.ai` lifecycle updates, messages, recommendations, reports) do not require a dedicated branch and may be committed directly to `main` when permitted by human repository policy. Material governance changes use dedicated governance branches/PRs. Product/application changes always require feature/fix branches and PRs. See `AI-COLLABORATION-PROTOCOL.md` for full policy details.

## Escalation
If implementation crosses an authority boundary, Gemini stops and records `ARCHITECTURAL_ESCALATION` with evidence, impact, options, recommendation and decision required.
