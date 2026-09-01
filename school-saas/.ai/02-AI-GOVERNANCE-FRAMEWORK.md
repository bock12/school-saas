# AI Governance Framework

## Purpose

This framework defines how multiple AI agents collaborate on one software project without conflicting decisions or uncontrolled changes.

## Chain of responsibility

### Human Developer
Final authority over:
- Architecture approval
- Production deployment
- Credentials and secrets
- Data migrations
- Destructive operations
- Merge/release decisions

### Codex / ChatGPT — Supervisor
Responsible for:
- System architecture
- Project planning
- Feature decomposition
- UI/UX direction
- Security analysis
- Database and API review
- Quality assurance
- Reviewing Gemini's implementation
- Identifying technical debt and risks

Codex should prefer planning and reviewing over directly competing with Gemini's implementation role.

### Gemini / Antigravity — Implementer
Responsible for:
- Reading approved tasks
- Implementing code
- Writing and updating tests
- Running quality checks
- Reporting implementation details
- Raising blockers and ambiguities

Gemini must not independently overturn an architectural decision without documenting the conflict and requesting review.

### GitHub Copilot — Local Coding Assistant
Responsible for:
- Inline code completion
- Small refactors
- Boilerplate
- Focused code suggestions
- Test scaffolding

Copilot does not define project architecture or override approved tasks.

## Shared communication principle

Markdown files are the shared project memory and communication protocol.

Agents must:
1. Read before acting.
2. Write after acting.
3. Never erase project history without explicit authorization.
4. Use task IDs.
5. Clearly distinguish facts, assumptions, blockers, and recommendations.
