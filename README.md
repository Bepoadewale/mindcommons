# MindCommons

**A Community-Owned AI Model Cooperative** is the working subtitle for an independent open-source prototype. MindCommons explores how communities could set continuing rules for research use of their contributions, and how software can apply those rules before a model job runs.

The first scenario uses fictional Nigerian community members and synthetic mental-health research material. It is not a real pilot, clinical product, health service, or established cooperative. No real health records are accepted.

## What this prototype is intended to show

- A community rule and an individual's permission are evaluated independently.
- Individual permission changes create a session-scoped, versioned history that can be inspected in the demo.
- A server-side, deterministic policy check authorizes a fixed research operation.
- An allowed operation can call a configured model; a denied operation must not call it.
- A decision and its provenance can be inspected afterward.
- A session-scoped JSON decision receipt records the policy and permission snapshot, required benefits, authorization reasons, inference attempt and release outcome without exporting model output or raw narratives.
- A fictional benefit commitment can be agreed, accepted by the research team, evidenced and reviewed without claiming real-world delivery.
- A version 2 policy may make selected benefit terms prerequisites to inference; version 1 agreements keep their original behavior.
- A portable Community AI Agreement is checked by MindCommons and by a separate minimal Worker example.

## Current status

The demo is publicly hosted at the URL below. Its server checks synthetic individual permission, community policy, and configured benefit prerequisites before a fixed model call. The live service has demonstrated denial before inference, session-scoped decision receipts, and one bounded synthetic Workers AI execution. The account's billing screenshots show Workers Free active and Workers Paid not subscribed; the “No data” usage view predates the latest deployment and is not a zero-usage guarantee. No paid fallback is configured. Shared free quotas can be exhausted, in which case requests may fail. Local automated tests use an explicitly labelled deterministic mock. See [project status](docs/fellowship/project-status.md) and [acceptance checklist](CHECKLIST.md) for evidence and remaining work.

## Architecture direction

The implementation uses a React and TypeScript single-page application, a Cloudflare Worker with Static Assets, D1, and a Workers AI binding. Static assets are served without Worker invocation; authorization runs in the API Worker. Local tests use an explicit deterministic mock; the hosted demo calls the configured Workers AI model for its approved synthetic job. See [system overview](docs/architecture/system-overview.md) and [decisions](docs/architecture/decisions.md). The proposed wireframe runs at `/vision/` locally and as a static GitHub Pages site; it contains no backend or inference behavior.

The [Community AI Agreement](packages/community-ai-agreement/README.md) provides a versioned JSON Schema and a deterministic TypeScript evaluator. The current synthetic agreement and schema are inspectable at `/api/agreement` and `/api/agreement/schema` in the live demo. The [separate Worker example](examples/portable-ai-worker/README.md) demonstrates reuse outside the MindCommons application. This protocol cannot control unrestricted copies of data or models outside participating services.

## Develop and verify

Requirements: Node.js 24+, npm 11+.

```bash
npm ci
npm run dev
```

`npm run dev` builds the app, applies D1 migrations to Wrangler's local SQLite database, and starts the Worker runtime at `http://127.0.0.1:8788`. Local inference uses an explicitly labelled deterministic mock; it does not call a model. Install Chromium once with `npx playwright install chromium`. `npm run test:agreement` runs portable agreement and receipt conformance tests without Cloudflare credentials. `npm run test:e2e` checks the reviewer UI using controlled API fixtures; `npm run test:e2e:fullstack` builds the app and checks it against the local Worker and D1. Both local integration paths use a clearly labelled mock, not live Workers AI. `npm run test:vision-static` builds and browser-tests the GitHub Pages vision-only artifact. `npm run verify` also checks that artifact, and runs formatting, lint, type checks, unit tests, production build, local migrations, API integration, and documentation checks.

For the protocol consumer example, see [`examples/portable-ai-worker/`](examples/portable-ai-worker/README.md). It shows caller authentication as an independent service responsibility, deterministic agreement evaluation before model execution, and an output-release recheck. The local conformance suite compares that consumer with the MindCommons evaluator. An agreement is not proof of representative authority and cannot constrain services that do not implement it.

## Public links

- Source: <https://github.com/Bepoadewale/mindcommons>
- Live demonstration: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>
- Captioned technical video: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4> (public 1920×1080 MP4; a <https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4> Pages fallback is available)
- Original screen recording: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4> (preserved; YouTube upload is still planned by the project owner)
- Future-product wireframe: <https://bepoadewale.github.io/mindcommons/> (public static visualization with expandable concepts; no API or AI execution)

## Privacy, research, and governance limits

The prototype must use synthetic content only. It is not suitable for patient data, clinical decisions, or human-subject research. The consent panel explains the fixed synthetic input, purpose, fictional requester, hosted model boundary, and limits of withdrawal; it is not legally valid consent. Demo roles are not identity verification, audit records are not tamper-proof, and a cloud inference call does not establish deletion from model weights. Application limits cap new sessions at 500/day, API requests at 60/minute/session, and model runs at 100/day; these safeguards do not guarantee account-wide free usage. Community authority, consent language, safeguarding, and benefit-sharing arrangements need to be co-designed before any real pilot. See [threat model](docs/security/threat-model.md), [privacy limitations](docs/security/privacy-limitations.md), [community authority](docs/governance/community-authority.md), and the conditional [SRHIN roadmap](docs/fellowship/srhin-embedded-roadmap.md).

## Contributing and license

Contributions are welcome under the [Apache License 2.0](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Changes to `main` go through pull requests and required checks.
