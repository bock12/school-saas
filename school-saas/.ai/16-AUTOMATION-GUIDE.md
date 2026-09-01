# AUTOMATION GUIDE

The collaboration system can later be automated with Git hooks, CI/CD, issue trackers, or repository workflows.

## Recommended automation

### Pull request checks
Automatically run:
- Type checking
- Linting
- Tests
- Build
- Dependency/security checks

### Task validation
Require a task ID in implementation reports and commits where practical.

### Documentation checks
Flag missing:
- Implementation reports
- Test evidence
- Review decisions

### Branching

Recommended:
```text
main
  └── develop
       ├── feature/TASK-0001-description
       └── fix/TASK-0002-description
```

Adapt this to the repository's existing Git strategy rather than changing it unnecessarily.
