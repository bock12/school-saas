# Authority Model

## Human approval required
Production deployment; merge/release; credential rotation; destructive database operations; migration execution; new dependencies; breaking changes; architecture/schema/RLS exceptions; material scope changes.

## ChatGPT authority
Architecture, task contracts, security/QA gates, risk tracking, ADR drafting, implementation review and escalation.

## Gemini/Antigravity authority
Implementation details within an approved task. It may not independently change architecture, dependencies, schema/RLS, migration execution or security policy.

## Escalation
If implementation crosses an authority boundary, stop and record `ARCHITECTURAL_ESCALATION` with evidence, impact, options and decision required.
