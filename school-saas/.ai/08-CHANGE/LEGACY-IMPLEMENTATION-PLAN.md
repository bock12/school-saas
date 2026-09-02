# Legacy Implementation Plan

**Status: Historical reference only. Not an active workflow source.**

The original plan described a Codex → Gemini collaboration model and top-level `.ai` files. AI-EOS replaces that model with:

1. Human Project Owner sets/approves scope.
2. ChatGPT performs repository-grounded architecture, planning, security and QA supervision.
3. ChatGPT creates/validates an approved task contract.
4. Gemini/Antigravity implements only approved scope.
5. Gemini records exact implementation and test evidence.
6. ChatGPT reviews the actual diff and records the verdict.
7. Human makes the final merge/release decision.

Active records are under `.ai/00-GOVERNANCE/`, `.ai/01-PROJECT/`, `.ai/02-ARCHITECTURE/`, `.ai/03-ENGINEERING/`, `.ai/04-SECURITY/`, `.ai/05-WORKFLOW/`, `.ai/06-MODULES/`, `.ai/07-RISK/`, `.ai/08-CHANGE/`, `templates/` and `prompts/`.

This file does not authorize implementation and must not override current AI-EOS governance.
