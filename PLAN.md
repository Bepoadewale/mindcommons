# Execution plan

## Strategy

Use a small full-stack web application on Cloudflare Workers with Static Assets: React/TypeScript assets, a narrow TypeScript API Worker, D1 for bounded synthetic session and audit records, and one Workers AI inference on a fixed synthetic corpus. Only `/api/*` invokes the Worker; static assets remain free and unlimited. Local tests use Wrangler's local D1 and an explicitly enabled mock; only a separately verified live request counts as live inference evidence. The app exposes a resettable, anonymous reviewer scenario, not real identity management.

## Phases and dependencies

1. **Environment and research — complete:** verified the Mac toolchain, GitHub identity, Mozilla RFP, current platform docs, existing solutions, Nigeria data-protection/ethics sources, and read-only DavDeploy lessons. Cloudflare account, free-plan state and the owner-authorized broad token were checked; only named MindCommons resources were provisioned.
2. **Repository foundation — complete:** public Apache-2.0 repository, protected PR-only `main`, required CI, security/contribution docs and resumable project records are in place. All changes to `main` went through PRs.
3. **Governance-controlled vertical slice — complete:** synthetic session, proposal/policy approval, independent individual permissions, fixed research request, fail-closed server authorization, actual bounded Workers AI inference, denial-before-inference, provenance, audit and hypothetical benefit record are implemented and verified.
4. **Reviewer experience — complete:** responsive accessible landing/demo, session isolation/reset, public video link, static `/vision/` wireframe, PWA manifest/service worker and bounded offline handling are deployed. Android installation prompt, launcher shortcut, and standalone launch were verified in an Android 16 Google Play emulator; physical-device coverage is not claimed.
5. **Quality/security — complete for the prototype scope:** unit, integration, browser and static accessibility checks, validation/quotas, security headers, threat model, dependency scan and secret scan pass in local evidence/CI. Real participant data and clinical uses remain out of scope.
6. **Hosted deployment — complete:** the dedicated D1 and Worker are deployed on Workers Free with Workers AI. Live allowed inference, prohibited-use denial, public HTTPS behavior and zero active paid subscriptions were checked. No DavDeploy production resource, custom route, DNS, email setting or paid add-on was changed.
7. **Submission evidence — complete:** reviewer guide, RFP traceability, roadmap, live demo, public video and future-vision wireframe are available. The site links directly to the public MP4 fallback; the owner may optionally replace the destination after uploading to YouTube.
8. **Final acceptance — technical prototype criteria complete:** CI and Pages publish pass, public URLs and MP4 are verified, `main` is protected, and Android install/standalone launch work in an emulator. A real-device spot check is optional follow-up; keep synthetic-only and community-co-design limits explicit.

## Routine decisions

See [architecture decisions](docs/architecture/decisions.md). Revisit only when authoritative documentation or a measured incompatibility changes the evidence.
