# Execution plan

## Strategy

Use a small full-stack web application on Cloudflare Workers with Static Assets: React/TypeScript assets, a narrow TypeScript API Worker, D1 for bounded synthetic session and audit records, and one Workers AI inference on a fixed synthetic corpus. Only `/api/*` invokes the Worker; static assets remain free and unlimited. Local tests use Wrangler's local D1 and an explicitly enabled mock; only a separately verified live request counts as live inference evidence. The app exposes a resettable, anonymous reviewer scenario, not real identity management.

## Phases and dependencies

1. **Environment and research — complete:** verified the Mac toolchain, GitHub identity, Mozilla RFP, current platform docs, existing solutions, Nigeria data-protection/ethics sources, and read-only DavDeploy lessons. Only dedicated MindCommons Cloudflare resources are in scope.
2. **Repository foundation — complete:** public Apache-2.0 repository, protected PR-only `main`, required CI, security/contribution docs and resumable project records are in place. All changes to `main` went through PRs.
3. **Governance-controlled vertical slice — complete and strengthened:** synthetic session, versioned collective policy, per-contributor purpose-specific permissions, portable Community AI Agreement evaluator, output-release recheck, actual bounded Workers AI inference, denial-before-inference, provenance/audit, and tracked fictional benefits are implemented. PRs #31–#33 and production D1 migrations 0005–0006 are merged/deployed; live post-deploy tests confirmed a contributor-specific filter and same-request policy denial.
4. **Reviewer experience — deployed; video refresh in progress:** responsive demo, session isolation/reset, static `/vision/` wireframe, PWA and bounded offline handling are deployed. Android installation and standalone launch passed in an Android 16 emulator. A new 92.84-second, 1080p captioned screen recording and links are prepared on `feat/live-demo-evidence-refresh`; publish and verify its Worker/Pages copies via PR.
5. **Quality/security — existing prototype gates pass; rerun required:** main CI run `44128935139` passed all four required checks; local positive/negative authorization, release rechecks, input controls and accessibility tests have passed. Rerun full local validation after the current video and documentation changes.
6. **Hosted deployment — current governance version deployed:** dedicated D1 migrations 0005–0006 and Worker version `a4471379-e78c-46b9-9313-0f8c8250038e` are live on the existing `workers.dev` host with D1/AI bindings. A previous same-day preflight reported zero active subscriptions; current billing-list API read failed 403, and no paid plan/resource was created or changed. Recheck public video links after their PR; do not claim current billing status beyond evidence.
7. **Submission evidence — in progress:** architecture, RFP traceability, roadmap, reviewer guide and solutions comparison updated. Publish the new recording, retain the original and independently verify both files on Worker and Pages; the owner may later provide a YouTube link.
8. **Final acceptance — pending video PR:** finish local validation, create a feature PR, pass required checks, merge and clean branches, verify Worker and Pages publication, then record final public-link evidence. Keep synthetic-only and community co-design limits explicit.

## Routine decisions

See [architecture decisions](docs/architecture/decisions.md). Revisit only when authoritative documentation or a measured incompatibility changes the evidence.
