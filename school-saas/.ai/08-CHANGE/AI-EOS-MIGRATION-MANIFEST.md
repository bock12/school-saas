# AI-EOS v1.1 Migration Manifest

Date: 2026-09-02  
Repository: `bock12/school-saas`  
Branch: `ai-eos/migrate-v1.1`  
Scope: Documentation/governance only. No application code, database migrations, RLS, authentication implementation, dependencies, or production configuration are changed by this migration.

## Objective
Migrate the legacy Codex Collaboration Playbook into a provider-independent SchoolSaaS AI Engineering Operating System (AI-EOS), while preserving project-specific engineering knowledge.

## Authority migration
OLD: Human → Codex Chief Architect/Supervisor → Gemini/Antigravity → GitHub

NEW: Human Project Owner → ChatGPT Chief Architect/Supervisor → approved tasks → Gemini/Antigravity → GitHub → ChatGPT review → Human approval

## Consolidation completed
- Duplicate coding standards, definition-of-done, implementation report, review queue, security policy, task queue, project context, architecture, decisions, roadmap and module-status records were consolidated into canonical numbered paths.
- Changelog, automation guidance and worked example were moved into canonical change/workflow paths.
- Legacy governance and implementation-plan material was archived under `08-CHANGE/` and explicitly marked non-authoritative.
- The detailed `SECURITY_AUDIT.md` remains at the top level as a preserved historical audit record; it is not a policy source. Current security rules live under `04-SECURITY/`.
- Useful historical implementation/security findings were merged into the canonical task, report, review and risk records.

## Canonical structure
- `AGENTS.md`
- `00-GOVERNANCE/`
- `01-PROJECT/`
- `02-ARCHITECTURE/`
- `03-ENGINEERING/`
- `04-SECURITY/`
- `05-WORKFLOW/`
- `06-MODULES/`
- `07-RISK/`
- `08-CHANGE/`
- `templates/`
- `prompts/`

## Preserved active security work
Credential exposure, unauthenticated privileged APIs, privileged server actions, tenant/RLS correction, authorization regression testing and RBAC reconciliation remain separate engineering tasks. This governance migration does not implement them.

## Merge gate
1. ChatGPT is the only AI Architect/Supervisor authority.
2. Gemini/Antigravity is implementation-only within approved scope.
3. Human approval boundaries remain explicit.
4. Historical security/architecture/task evidence is preserved.
5. No duplicate active governance records remain.
6. No application/security implementation changes are included.
