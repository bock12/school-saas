# AGENTS.md

## Mandatory startup procedure

Before making changes:

1. Read this file.
2. Read `PROJECT_CONTEXT.md`.
3. Read `ARCHITECTURE.md`.
4. Read `CODING_STANDARDS.md`.
5. Read `SECURITY_POLICY.md`.
6. Read the active task in `TASK_QUEUE.md`.
7. Check `DECISIONS.md` for relevant decisions.
8. Inspect the existing implementation before creating new abstractions.

## Authority

- Human decisions override all AI decisions.
- Approved architecture decisions override individual agent preferences.
- A task must exist before substantial implementation begins.
- Security and data-isolation requirements are mandatory.
- Do not expose secrets in source code, logs, Markdown, commits, or reports.

## File communication

Use these states:

`BACKLOG → APPROVED → IN_PROGRESS → IMPLEMENTED → UNDER_REVIEW → CHANGES_REQUESTED → APPROVED_FOR_MERGE → COMPLETED`

Do not mark work COMPLETED merely because code was written.

## Safe change rules

- Do not modify unrelated files.
- Do not delete functionality without explicit approval.
- Do not change database schemas without migration planning.
- Do not disable security controls to make tests pass.
- Do not replace an existing library or architecture without justification.
- Preserve backward compatibility unless the task explicitly permits breaking changes.

## Reporting

Every implementation must report:
- Task ID
- Files changed
- What was implemented
- Tests/checks run
- Results
- Known limitations
- Security considerations
- Follow-up work
