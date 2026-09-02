# Architecture Decisions

## ADR-0001 - Canonical AI governance records use underscore filenames

**Date:** 2026-09-01

**Status:** Proposed - pending human acceptance

**Authority:** Codex recommendation; human approval required

### Context

The requested structure specifies underscore filenames (`PROJECT_CONTEXT.md`, `CODING_STANDARDS.md`, `SECURITY_POLICY.md`, `DEFINITION_OF_DONE.md`), while pre-existing hyphen-named counterparts contain starter guidance. Keeping both as active records would create drift.

### Decision

Use the requested underscore-named records as canonical from 2026-09-01. Preserve hyphen-named counterparts as legacy/reference documentation; do not delete them. `.ai/AGENTS.md` directs agents to canonical records.

### Alternatives

Delete/rename legacy files (rejected: loses history); keep both active (rejected: conflicts drift); retain only hyphen files (rejected: does not meet requested structure).

### Consequences

New work updates canonical records. A future human-approved cleanup may archive legacy documents after checking external references.

## ADR protocol

New ADRs cover material architecture, schema/RLS, dependency, integration, boundary, and compatibility choices. Record evidence, options, decision, consequences, security/data impact, rollout/rollback, authority, and links. A human accepts material operational decisions.
