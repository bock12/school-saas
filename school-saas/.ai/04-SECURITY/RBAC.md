# RBAC Baseline

The repository contains role definitions that require reconciliation across database migrations and application types/logic. Until canonicalization is completed, do not add new roles casually.

Target model:
- one canonical role vocabulary;
- centralized permission semantics;
- server-side operation enforcement;
- RLS alignment;
- explicit role hierarchy;
- negative tests for every privileged operation.

UI visibility is never an authorization boundary.
