# Definition of Done

`APPROVED_FOR_MERGE` requires applicable evidence below. `COMPLETED` additionally needs human merge/release confirmation or explicit human closure.

## Delivery

- [ ] Approved objective and acceptance criteria met.
- [ ] Scope changes, assumptions, and deferrals recorded.
- [ ] Errors, edge cases, compatibility, and applicable UI states handled or accepted.

## Engineering

- [ ] Existing patterns inspected; no unnecessary dependency, abstraction, or duplication introduced.
- [ ] Relevant types, lint, tests, build, and manual checks run where available.
- [ ] Exact evidence and environment blockers recorded.
- [ ] No unsafe bypass, debug endpoint, unexplained runtime error, or unsafe TODO remains.

## Security and data

- [ ] Authentication, authorization, tenant isolation, validation, and object/file scope reviewed where applicable.
- [ ] RLS/service-role and migration safety reviewed where applicable.
- [ ] No secrets, personal data, or unsafe logs introduced.
- [ ] Mandatory security findings resolved or explicitly accepted by human.

## Governance

- [ ] Implementation report documents actual changes, checks, limitations, security impact, and follow-up.
- [ ] ADR, risk, module status, security record, and changelog updated where applicable.
- [ ] Independent review recorded; all findings resolved or formally accepted.
