# Architecture Decisions

## ADR-0001 — AI-EOS authority migration
**Date:** 2026-09-02  
**Status:** Proposed — human acceptance required  
**Authority:** ChatGPT recommendation; human approval required

### Context
The original collaboration model made Codex Chief Software Architect/Project Supervisor. Codex availability is no longer sufficient for the project. The repository must remain provider-independent while preserving Gemini/Antigravity implementation and human final authority.

### Decision
Use ChatGPT as Chief Software Architect and Project Supervisor. Gemini/Antigravity remains Implementation Engineer. GitHub is source of truth. Human retains final authority over merge/release, production, credentials, destructive operations, migration execution and material architecture/security exceptions.

### Consequences
AI-EOS governance can continue without Codex. No application behavior changes are implied by this governance migration.

## ADR-0002 — Canonical `.ai` structure
**Status:** Proposed — human acceptance required

Consolidate duplicate top-level policy files into the AI-EOS categorized structure. Preserve substantive project/security/task history; do not maintain competing active copies.

## ADR protocol
New ADRs cover material architecture, schema/RLS, dependency, integration, boundary and compatibility choices. Record evidence, alternatives, decision, consequences, security/data impact, rollout/rollback, authority and links. Human acceptance is required for material operational decisions.
