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

## Existing-file disposition

| Existing file | Action | Target / rationale |
|---|---|---|
| `AGENTS.md` | REPLACE | Canonical `.ai/AGENTS.md`; migrate Codex authority to ChatGPT |
| `ARCHITECTURE.md` | MERGE | `02-ARCHITECTURE/ARCHITECTURE.md`; preserve useful principles |
| `AUTOMATION-GUIDE.md` | MERGE | `08-CHANGE/` or governance records; preserve operational guidance |
| `CHANGELOG.md` | MERGE | `08-CHANGE/CHANGELOG.md` |
| `CODING-STANDARDS.md` | MERGE | `03-ENGINEERING/CODING-STANDARDS.md`; resolve duplicate |
| `CODING_STANDARDS.md` | MERGE | `03-ENGINEERING/CODING-STANDARDS.md`; preserve stronger content |
| `DECISIONS.md` | MERGE | `02-ARCHITECTURE/DECISIONS.md` |
| `DEFINITION-OF-DONE.md` | MERGE | `05-WORKFLOW/DEFINITION-OF-DONE.md` |
| `DEFINITION_OF_DONE.md` | MERGE | `05-WORKFLOW/DEFINITION-OF-DONE.md`; preserve stronger content |
| `GOVERNANCE-FRAMEWORK.md` | MERGE/REPLACE | `00-GOVERNANCE/AI-GOVERNANCE.md` and authority model |
| `IMPLEMENTATION-PLAN.md` | PRESERVE/MERGE | `01-PROJECT/ROADMAP.md` or project planning record |
| `IMPLEMENTATION-REPORT.md` | MERGE | `05-WORKFLOW/IMPLEMENTATION-REPORT.md` |
| `IMPLEMENTATION_REPORT.md` | MERGE | `05-WORKFLOW/IMPLEMENTATION-REPORT.md`; preserve stronger template/report content |
| `MODULE_STATUS.md` | MERGE | `01-PROJECT/MODULE-STATUS.md` |
| `PROJECT-CONTEXT.md` | MERGE | `01-PROJECT/PROJECT-CONTEXT.md` |
| `PROJECT_CONTEXT.md` | MERGE | `01-PROJECT/PROJECT-CONTEXT.md`; preserve stronger content |
| `README.md` | REPLACE | AI-EOS overview and startup guidance |
| `REVIEW-QUEUE.md` | MERGE | `05-WORKFLOW/REVIEW-QUEUE.md` |
| `REVIEW_QUEUE.md` | MERGE | `05-WORKFLOW/REVIEW-QUEUE.md`; preserve stronger content |
| `RISKS.md` | PRESERVE/MERGE | `07-RISK/RISKS.md` |
| `ROADMAP.md` | PRESERVE/MERGE | `01-PROJECT/ROADMAP.md` |
| `SECURITY-AUDIT.md` | PRESERVE | `04-SECURITY/SECURITY-AUDIT.md`; audit evidence is institutional history |
| `SECURITY-POLICY.md` | MERGE | `04-SECURITY/SECURITY-POLICY.md` |
| `SECURITY_POLICY.md` | MERGE | `04-SECURITY/SECURITY-POLICY.md`; preserve stronger content |
| `TASK-QUEUE.md` | ARCHIVE/CONSOLIDATE | `05-WORKFLOW/TASK-QUEUE.md`; short duplicate must not remain authoritative |
| `TASK_QUEUE.md` | KEEP/MERGE | `05-WORKFLOW/TASK-QUEUE.md`; active security tasks preserved |
| `WORKED-EXAMPLE.md` | MERGE | `05-WORKFLOW/`; preserve useful collaboration example |
| `templates/*` | MERGE/EXPAND | `templates/`; preserve useful existing templates and add AI-EOS fields |

## New governance records

- `00-GOVERNANCE/AI-GOVERNANCE.md`
- `00-GOVERNANCE/AI-ROLES.md`
- `00-GOVERNANCE/AUTHORITY-MODEL.md`
- `00-GOVERNANCE/ESCALATION-POLICY.md`
- `00-GOVERNANCE/REPOSITORY-TRUTH.md`
- `00-GOVERNANCE/AUDIT-PROTOCOL.md`
- `02-ARCHITECTURE/CURRENT-STATE.md`
- `02-ARCHITECTURE/TARGET-ARCHITECTURE.md`
- `03-ENGINEERING/TESTING-STANDARDS.md`
- `04-SECURITY/SECURITY-ARCHITECTURE.md`
- `04-SECURITY/PRIVILEGED-ACCESS.md`
- `04-SECURITY/TENANT-ISOLATION.md`
- `04-SECURITY/RBAC.md`
- `04-SECURITY/THREAT-MODEL.md`
- `06-MODULES/SECURITY-CONTROL-MATRIX.md`
- `07-RISK/INCIDENTS.md`
- `08-CHANGE/MIGRATIONS.md`
- `prompts/CHATGPT-ARCHITECT.md`
- `prompts/GEMINI-IMPLEMENTER.md`
- `prompts/COPILOT.md`

## Preserved active security work

The migration preserves the previously identified security work around credential exposure, unauthenticated privileged APIs, privileged server actions, tenant/RLS correction, authorization regression tests, and RBAC reconciliation. These remain separate engineering tasks and are not implemented by this governance migration.

## Validation requirements

Before merging this migration:
1. There is one canonical authority document.
2. Codex is no longer described as project authority.
3. ChatGPT is described as Chief Software Architect / Project Supervisor.
4. Gemini/Antigravity remains implementation-only within approved scope.
5. Human approval boundaries remain explicit.
6. Existing security/architecture/task history is preserved.
7. Duplicate files are not simultaneously authoritative.
8. No application/security implementation changes are included.
