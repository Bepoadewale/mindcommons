# Execution plan

## Strategy

Use a small full-stack web application on Cloudflare Pages: React/TypeScript assets, Pages Functions for the API, D1 for bounded synthetic session and audit records, and one Workers AI inference on a fixed synthetic corpus. Local tests use Wrangler's local D1 and a mock AI binding; only a separately verified live request counts as live inference evidence. The app exposes a resettable, anonymous reviewer scenario, not real identity management.

## Phases and dependencies

1. **Environment and evidence:** verified the toolchain, GitHub identity, Mozilla RFP, official platform docs, existing solutions and read-only DavDeploy lessons. Cloudflare account access remains unverified.
2. **Repository foundation:** public repo, Apache-2.0, PR-only protected `main`, documentation and required CI are established. PRs #1, #2, and #3 merged.
3. **Governance-controlled vertical slice:** synthetic session, policy and individual-permission checks, fixed research request, fail-closed decision, mock-only local inference, provenance, audit and denied path are implemented. Live AI remains unverified.
4. **Reviewer experience:** responsive accessible landing/demo, session isolation/reset, benefit records, `/vision/` wireframe and installable PWA assets are implemented. Android install has not been device-tested.
5. **Quality/security:** unit, integration, browser tests, limits, headers, threat model, dependency and secret checks are implemented and locally/CI verified as recorded in `STATE.md`.
6. **Hosted deployment:** blocked until account-owner authorization and free resource scope can be verified. No resources have been provisioned.
7. **Submission evidence:** reviewer guide, RFP traceability and roadmap are documented. Production-accurate public video and public vision link await deployment or separately verified hosting.
8. **Final acceptance:** pending live deployment/inference, public URLs, video, Android/device check and final production verification. Recheck CI, public links, branch cleanup and DavDeploy isolation at that stage.

## Routine decisions

See [architecture decisions](docs/architecture/decisions.md). Revisit only when authoritative documentation or a measured incompatibility changes the evidence.
