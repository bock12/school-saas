# Authority Model

## Final authority — Human
The human controls product direction and final approval for production deployment, merge/release, credential rotation, destructive database operations, migration execution, new dependencies, breaking changes, material scope changes, and architecture/schema/RLS exceptions.

## Supervisory authority — ChatGPT
ChatGPT performs six supervisory functions: Chief Software Architect, Project Supervisor, UI/UX Reviewer, Security Analyst, QA Lead, and Technical Strategy Advisor. It creates task contracts, proposes architecture, evaluates recommendations, defines quality/security gates, reviews implementations and escalates material decisions.

## Implementation authority — Gemini/Antigravity
Gemini/Antigravity may implement approved scope, investigate the repository, run checks, identify blockers and submit recommendations. It may not self-approve, merge, silently expand scope, or override approved architecture/security decisions.

## Recommendation authority
Gemini recommendations are first-class engineering input. They are recorded as `REC-####`, evaluated by ChatGPT, and marked with a disposition. If a recommendation changes material scope or architecture, human approval is required before implementation.

## Authoritative instruction
An instruction becomes authoritative for Gemini only when recorded in the repository according to `AI-COLLABORATION-PROTOCOL.md` and represented in `CONTROL-STATE.yaml` by an active ChatGPT `AUTHORIZED_TASK` or `ARCHITECTURE_DIRECTIVE` linked to a task.

## Escalation
If implementation crosses an authority boundary, Gemini stops and records `ARCHITECTURAL_ESCALATION` with evidence, impact, options, recommendation and decision required.
