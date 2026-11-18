# Execution plan

## Strategy

Use a small full-stack web application on Cloudflare Workers with Static Assets: React/TypeScript assets, a narrow TypeScript API Worker, D1 for bounded synthetic session and audit records, and one Workers AI inference on a fixed synthetic corpus. Only `/api/*` invokes the Worker; static assets remain free and unlimited. Local tests use Wrangler's local D1 and an explicitly enabled mock; only a separately verified live request counts as live inference evidence. The app exposes a resettable, anonymous reviewer scenario, not real identity management.

## Phases and dependencies

1. **Environment and research — complete:** verified the Mac toolchain, GitHub identity, Mozilla RFP, current platform docs, existing solutions, Nigeria data-protection/ethics sources, and read-only DavDeploy lessons. Only dedicated MindCommons Cloudflare resources are in scope.
2. **Repository foundation — complete:** public Apache-2.0 repository, protected PR-only `main`, required CI, security/contribution docs and resumable project records are in place. All changes to `main` went through PRs.
3. **Governance-controlled vertical slice — complete and strengthened:** synthetic session, versioned collective policy, per-contributor purpose-specific permissions, portable Community AI Agreement evaluator, output-release recheck, actual bounded Workers AI inference, denial-before-inference, provenance/audit, and tracked fictional benefits are implemented. PRs #31–#33 and production D1 migrations 0005–0006 are merged/deployed; live post-deploy tests confirmed a contributor-specific filter and same-request policy denial.
4. **Reviewer experience — complete:** responsive demo, session isolation/reset, static `/vision/` wireframe, PWA and bounded offline handling are deployed. Android installation and standalone launch passed in an Android 16 emulator. PR #34 published the new 92.84-second, 1080p explanatory-caption video on Worker and Pages and links both new and original videos.
5. **Quality/security — complete for prototype scope:** PR #34 post-merge main CI run `44134751119` passed all four required checks. Local verification passed with 38 unit tests, six reviewer browser tests, three vision browser tests, local Worker/D1 integration, and output-release concurrency checks.
6. **Hosted deployment — complete for current release:** Dedicated D1 migrations 0001–0008 and Worker version `a12cd688-9975-44a6-a3ee-9c8c2dfe4974` are live on the existing `workers.dev` host with D1/AI bindings. Owner-shared screenshots show Workers Free active and Workers Paid not subscribed. The billable-usage page showed “No data” at capture time, before deployment; because the dashboard refreshes daily, this is not proof of zero post-deployment usage. No paid plan/resource was enabled or changed. The public app, static vision, and video links were checked.
7. **Submission evidence — complete:** architecture, RFP traceability, roadmap, reviewer guide, solution comparison and public video links are updated. Worker and Pages copies of both recordings are public and verified. The owner may later provide a YouTube link.
8. **Final acceptance — strengthened release verified:** PRs #37–#43 merged through protected `main`; required checks and post-merge CI/Pages passed. Production migration, deployment, HTTPS, benefit-gate denial before inference, scoped receipts, and one bounded live synthetic inference were verified. Do not make additional live inference calls for validation. Keep synthetic-only and community co-design limits explicit.

## Routine decisions

See [architecture decisions](docs/architecture/decisions.md). Revisit only when authoritative documentation or a measured incompatibility changes the evidence.

## Fellowship technical-strengthening track (started 2026-11-17)

The code audit found that benefit stages were persisted but never affected authorization. Preserve the existing implementation and address the narrow gap in ordered PRs:

1. **Benefit prerequisites and agreement validity — merged in PR #37 and deployed:** retain schema `1.0.0` semantics, introduce schema `2.0.0` with explicit required benefit IDs and optional expiry, propagate per-policy prerequisites from D1, test denial before inference and conditional output withholding. The fictional proposal opts into the gate; the initial policy remains permissive.
2. **Consent and governance clarity — merged in PR #38:** explain the fictional processing lifecycle and withdrawal limits in the existing UI; document alternative governance arrangements, cross-session rejection tests, trust boundaries and host-dependent decisions without claiming community validation.
3. **Privacy and protocol evidence — merged in PR #39 and deployed:** add receipt schema/migration, session-scoped export, portable consumer conformance coverage and developer integration guidance. The receipt records live/mock mode and omits outputs and raw narratives.
4. **Reviewer and fellowship evidence — merged in PR #40 and deployed:** add a seven-step walkthrough and a deterministic, no-inference policy preview from the current agreement snapshot. The preview is not authoritative; the API checks again at execution. The SRHIN roadmap and reserved-decision document exist.

On 2026-11-18, the owner shared Cloudflare dashboard screenshots showing Workers Free active, Workers Paid not subscribed, and “No data” on the billable-usage page at capture time. Following exact-resource checks, only additive migrations 0007 and 0008 and the dedicated Worker were deployed. The screenshot predates deployment and daily usage refresh means it cannot establish zero post-deployment charges. No paid service was enabled; future usage must remain within current free allowances.
