# Security Incidents

## SEC-005 — Credential exposure
**Status:** Open containment required.

Static audit confirms tracked migration-runner scripts contain embedded database credentials. Do not reproduce values. Human/security owner controls rotation/revocation, history assessment and cleanup.

## Handling rule
Security records must contain sanitized evidence only. Never place secrets, production dumps, personal data or operational exploit instructions in `.ai/`.
