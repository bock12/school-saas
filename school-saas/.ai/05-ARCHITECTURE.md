# ARCHITECTURE.md

## Architecture governance

Architecture should optimize for:
1. Security
2. Correctness
3. Maintainability
4. Testability
5. Performance
6. Developer productivity
7. User experience

## Before introducing a new abstraction

Ask:
- Does an existing service/component solve this?
- Does this belong in the current module?
- Will it create circular dependencies?
- Does it complicate testing?
- Does it create duplicated business logic?
- Does it affect tenant isolation or authorization?

## Database changes

Every schema change must consider:
- Migration safety
- Existing data
- Indexes
- Foreign keys
- Constraints
- RLS/authorization
- Audit requirements
- Rollback strategy

## API changes

Document:
- Input
- Output
- Authentication
- Authorization
- Validation
- Errors
- Rate/abuse considerations where relevant

## UI architecture

Prefer:
- Reusable components
- Consistent design tokens
- Accessible forms
- Loading/error/empty states
- Responsive layouts
- Predictable navigation
