# Implementation Plan

## Phase 1 — Create the AI collaboration structure

Create this folder in the repository:

```text
.ai/
├── AGENTS.md
├── PROJECT_CONTEXT.md
├── ROADMAP.md
├── ARCHITECTURE.md
├── CODING_STANDARDS.md
├── SECURITY_POLICY.md
├── DEFINITION_OF_DONE.md
├── TASK_QUEUE.md
├── IMPLEMENTATION_REPORT.md
├── REVIEW_QUEUE.md
├── DECISIONS.md
├── RISKS.md
├── CHANGELOG.md
└── templates/
    ├── TASK_TEMPLATE.md
    ├── REPORT_TEMPLATE.md
    └── REVIEW_TEMPLATE.md
```

## Phase 2 — Install the governing instructions

1. Give Codex the prompt in `prompts/CODEX_SYSTEM_PROMPT.md`.
2. Give Gemini/Antigravity the prompt in `prompts/GEMINI_SYSTEM_PROMPT.md`.
3. Make both agents read `.ai/AGENTS.md` before working.
4. Keep the Markdown files committed to Git so they become project history.

## Phase 3 — Feature workflow

For every feature:

1. Codex analyzes the request.
2. Codex checks architecture, security, dependencies, and UI implications.
3. Codex creates a task in `TASK_QUEUE.md`.
4. Gemini reads the task and relevant project documents.
5. Gemini implements the task.
6. Gemini runs tests, linting, type checking, and relevant build checks.
7. Gemini records results in `IMPLEMENTATION_REPORT.md`.
8. Codex reviews the implementation against the task and Definition of Done.
9. If changes are needed, Codex records them in `REVIEW_QUEUE.md`.
10. Gemini addresses review items.
11. Codex approves the work.
12. Human developer reviews the Git diff and merges/commits.
13. `CHANGELOG.md` and `DECISIONS.md` are updated when appropriate.

## Phase 4 — Quality gates

Before a task is marked complete, require:
- Type checking
- Linting
- Unit/integration tests where applicable
- Build verification
- Security review for sensitive changes
- Database/RLS review for multi-tenant data
- UI/accessibility review for user-facing changes
- No unexplained TODOs or temporary bypasses
- Documentation updated where behavior or architecture changed

## Phase 5 — Git discipline

Use small, focused commits. Never allow an AI agent to silently rewrite unrelated work.

Recommended commit style:

```text
feat(attendance): add QR check-in flow
fix(auth): enforce tenant membership check
refactor(students): extract enrollment service
test(attendance): add duplicate check-in coverage
docs(ai): update architecture decision
```

## Phase 6 — Deployment discipline

Development → Review → Staging/Test → Production.

Never deploy directly from an unreviewed AI-generated change.

## Phase 7 — Continuous improvement

At the end of each milestone:
- Review recurring implementation errors.
- Update coding standards.
- Update security rules.
- Update prompts when agent behavior needs correction.
- Archive completed tasks.
- Record important architectural decisions.
