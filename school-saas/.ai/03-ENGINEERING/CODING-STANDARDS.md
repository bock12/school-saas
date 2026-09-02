# Coding Standards

- Make the smallest clear approved change; reuse inspected repository patterns.
- Keep modules cohesive; avoid hidden side effects, unrelated cleanup and duplicate business logic.
- Avoid new `any`; validate untrusted data at trusted boundaries.
- Prefer server components for trusted reads; use client components only for necessary interactivity.
- Treat route/search params, headers, bodies, forms, IDs, files and client claims as untrusted.
- Explicitly authorize and tenant-scope every protected server operation.
- Never expose privileged credentials or import server-only data access into browser code.
- Async UI needs loading, error, empty, success, permission, responsive and accessible states.
- Run proportionate checks and record exact commands/results; never claim a check without evidence.
- Comment rationale, not syntax. Never place secrets or personal data in comments, fixtures or reports.
