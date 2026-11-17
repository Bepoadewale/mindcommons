# Execution plan

## Strategy

Use a small full-stack web application on Cloudflare Workers with Static Assets: React/TypeScript assets, a narrow TypeScript API Worker, D1 for bounded synthetic session and audit records, and one Workers AI inference on a fixed synthetic corpus. Only `/api/*` invokes the Worker; static assets remain free and unlimited. Local tests use Wrangler's local D1 and an explicitly enabled mock; only a separately verified live request counts as live inference evidence. The app exposes a resettable, anonymous reviewer scenario, not real identity management.

## Phases and dependencies

1. **Environment and evidence:** verified the toolchain, GitHub identity, Mozilla RFP, official platform docs, existing solutions and read-only DavDeploy lessons. Cloudflare account and token were verified; the owner chose to retain the broad account token. Mutations remain limited to the exact named MindCommons resources after a read-only preflight.
2. **Repository foundation:** public repo, Apache-2.0, PR-only protected `main`, documentation and required CI are established. PRs #1, #2, and #3 merged.
3. **Governance-controlled vertical slice:** synthetic session, policy and individual-permission checks, fixed research request, fail-closed decision, mock-only local inference, provenance, audit and denied path are implemented. Live AI remains unverified.
4. **Reviewer experience:** responsive accessible landing/demo, session isolation/reset, benefit records, `/vision/` wireframe and installable PWA assets are implemented. Android install has not been device-tested.
5. **Quality/security:** unit, integration, browser tests, limits, headers, threat model, dependency and secret checks are implemented and locally/CI verified as recorded in `STATE.md`.
6. **Hosted deployment:** the named D1 database has been provisioned and migrated. Confirm the default Workers Free plan and deploy the named Worker with no custom domain, route, Pages, DNS, or paid add-on.
7. **Submission evidence:** reviewer guide, RFP traceability and roadmap are documented. The static, vision-only GitHub Pages wireframe is public and verified. Production-accurate public video and the live backend URL still require the Cloudflare deployment.
8. **Final acceptance:** pending live deployment/inference, public URLs, video, Android/device check and final production verification. Recheck CI, public links, branch cleanup and DavDeploy isolation at that stage.

## Routine decisions

See [architecture decisions](docs/architecture/decisions.md). Revisit only when authoritative documentation or a measured incompatibility changes the evidence.
