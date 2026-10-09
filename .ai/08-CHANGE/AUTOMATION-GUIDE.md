# Automation Guide

The AI-EOS workflow can later be automated with Git hooks, CI/CD, issue trackers or repository workflows.

## Recommended PR checks
- Type checking
- Linting
- Tests
- Build
- Dependency/security checks

## Task validation
Require a task ID in implementation reports and commits where practical.

## Documentation checks
Flag missing implementation reports, test evidence and review decisions.

## Branching
Adapt automation to the repository's AI-EOS Governance Persistence & Branching Policy:
- **Routine control-plane changes:** Routine `.ai` task lifecycle, messages, recommendations, reports, and control-state updates do not require a dedicated branch and may commit directly to `main` when permitted by human repository policy.
- **Material governance changes:** Changes to authority, roles, security policies, or collaboration protocols use dedicated governance branches (e.g. `ai-eos/governance-*`) and PRs.
- **Product/application changes:** All application code, schema, migrations, RLS, dependency, and infrastructure work must use standard feature/fix branches and pull requests. Never commit application code directly to `main`.
- **Principle:** Branches represent meaningful change sets, not individual AI conversations or messages.
