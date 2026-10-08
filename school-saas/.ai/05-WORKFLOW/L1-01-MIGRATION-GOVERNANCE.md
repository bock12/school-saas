# L1-01 Migration Governance Note

## Status

**Active technical-debt control — no migration history rewrite authorized.**

## Current inventory

The current repository contains 51 SQL migration files. Numeric prefixes 018, 022, and 024 are duplicated.

Existing duplicate-prefix migrations must be treated as immutable migration history unless a separately approved migration strategy explicitly addresses their execution model.

## Rule for new migrations

1. Do not rename or renumber existing migration files.
2. Do not insert a new migration by reusing an existing numeric prefix.
3. New migrations must use a unique, monotonically increasing migration identifier according to the project's Supabase migration tooling and repository convention.
4. Before creating a migration, inspect the complete migration directory and verify identifier uniqueness.
5. Schema changes, RLS changes, constraints, indexes, and security-definer functions must be reviewed together with their authorization and tenant-isolation implications.
6. Do not manually reorder migration history to repair duplicate prefixes.
7. Any need to reconcile historical duplicate identifiers requires a dedicated migration/repository-governance task with rollback analysis and human approval.

## Why this exists

The duplicate prefixes are a repository-history concern. Renaming already-applied migrations can cause migration-state divergence between environments. The safe Level-1 approach is therefore to preserve history and prevent additional ambiguity.

## L1-01 finding

The duplicate prefixes are **MEDIUM technical debt**, not an authorization decision and not a reason to redesign the database.

## Ownership

Detailed migration execution policy and any historical reconciliation remain separate from L1-01 and require explicit task authorization.
