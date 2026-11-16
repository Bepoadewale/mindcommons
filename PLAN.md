# Execution plan

## Strategy

Use a small full-stack web application on Cloudflare Pages: React/TypeScript assets, Pages Functions for the API, D1 for bounded synthetic session and audit records, and one Workers AI inference on a fixed synthetic corpus. Local tests use Wrangler's local D1 and a mock AI binding; only a separately verified live request counts as live inference evidence. The app exposes a resettable, anonymous reviewer scenario, not real identity management.

## Phases and dependencies

1. **Environment and evidence:** verify toolchain and accounts; inspect Mozilla RFP and official platform docs; read DavDeploy repositories without changes; record research. (In progress.)
2. **Repository foundation:** public repo, Apache-2.0, PR-only `main`, docs and CI. (Repository created; foundation PR underway.)
3. **Governance-controlled vertical slice:** synthetic session, policy and individual-permission checks, fixed research request, fail-closed decision, AI call, provenance, audit, denied path.
4. **Reviewer experience:** responsive accessible landing/demo, session isolation/reset, benefit records, vision route, installable PWA.
5. **Quality/security:** unit, integration, browser tests, limits, headers, threat model, dependency and secret checks.
6. **Hosted deployment:** only after account access and free resource scope are verified; provision new named resources and verify independently.
7. **Submission evidence:** record actual application behavior, public video, vision, reviewer guide, traceability and limitations.
8. **Final acceptance:** run required suites, check public links and repository protection, confirm branch cleanup and no DavDeploy changes.

## Routine decisions

See [architecture decisions](docs/architecture/decisions.md). Revisit only when authoritative documentation or a measured incompatibility changes the evidence.
