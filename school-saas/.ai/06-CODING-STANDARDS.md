# CODING_STANDARDS.md

## General

- Prefer simple, explicit solutions.
- Follow the repository's existing conventions.
- Avoid unnecessary dependencies.
- Avoid duplicated business logic.
- Keep functions/components focused.
- Use meaningful names.
- Remove dead code when safe.

## Type safety

- Avoid `any` unless explicitly justified.
- Validate external input.
- Keep domain types close to the domain they describe.

## Error handling

Errors should be:
- Expected where possible
- Meaningful to developers
- Safe for users
- Free of secrets or sensitive data

## Frontend

Every important async screen should consider:
- Loading state
- Error state
- Empty state
- Success feedback
- Permission restrictions
- Mobile responsiveness

## Tests

Tests should focus on:
- Business rules
- Authorization
- Critical workflows
- Edge cases
- Regression-prone behavior

## Comments

Comment the reason behind non-obvious decisions, not obvious syntax.
