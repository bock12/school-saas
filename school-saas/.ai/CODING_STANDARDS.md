# Coding Standards

Repository `AGENTS.md` remains mandatory for Next.js-specific guidance.

- Make the smallest clear approved change. Reuse inspected patterns before adding components, helpers, types, routes, or libraries.
- Keep modules cohesive; avoid hidden side effects, unrelated cleanup, and duplicate business logic. Track debt separately.
- Avoid new `any`; validate all untrusted data at trusted boundaries and keep domain types near their domain.
- Read relevant installed Next.js guidance before unfamiliar APIs as root `AGENTS.md` requires.
- Prefer server components for trusted reads; use client components only for necessary interactivity.
- Treat route/search params, headers, bodies, form data, IDs, files, and client claims as untrusted. Explicitly authorize and tenant-scope every protected server operation.
- Never import server-only data access into browser code or expose privileged credentials.
- User-facing async work needs appropriate loading, error, empty, success, permission, responsive, and accessible states.
- Run proportionate checks and record exact command, pass/fail result, omission, and blocker. Never claim a check without evidence.
- Comment non-obvious rationale, not syntax. Never put secrets or personal data in comments, fixtures, reports, or examples.
