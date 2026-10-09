# AI Collaboration Messages

Messages are durable workflow records between ChatGPT and Gemini/Antigravity.

## Types
- `AUTHORIZED_TASK` — ChatGPT authorizes implementation of a linked task.
- `ARCHITECTURE_DIRECTIVE` — ChatGPT records an approved architectural direction.
- `IMPLEMENTATION_RESPONSE` — Gemini reports implementation results.
- `RECOMMENDATION` — Gemini submits an engineering recommendation.
- `BLOCKER` — Gemini reports work that cannot safely continue.
- `REVIEW` — ChatGPT records review findings and disposition.

## Naming
Use `MSG-####.md` for messages. Link each message to the relevant task, PR, review, recommendation or ADR.

## Authority
Only repository records satisfying the handshake in `AI-COLLABORATION-PROTOCOL.md` are authoritative instructions. Recommendations and reports are evidence, not approval.

## Safety
Never include credentials, tokens, private keys, production dumps, personal data or exploit-enabling secrets in message records.
