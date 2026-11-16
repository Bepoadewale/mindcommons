# MindCommons

**A Community-Owned AI Model Cooperative** is the working subtitle for an independent open-source prototype. MindCommons explores how communities could set continuing rules for research use of their contributions, and how software can apply those rules before a model job runs.

The first scenario uses fictional Nigerian community members and synthetic mental-health research material. It is not a real pilot, clinical product, health service, or established cooperative. No real health records are accepted.

## What this prototype is intended to show

- A community rule and an individual's permission are evaluated independently.
- A server-side, deterministic policy check authorizes a fixed research operation.
- An allowed operation can call a configured model; a denied operation must not call it.
- A decision and its provenance can be inspected afterward.
- A community benefit commitment can be tracked without claiming it has been delivered.

## Current status

The core synthetic scenario is implemented and runs locally. Unit, local Pages + D1 integration, browser, and full-stack browser checks pass. The full-stack test uses an explicitly labelled deterministic mock, so it does not prove a live model call. No production Cloudflare resources or public demo have been deployed. See [project status](docs/fellowship/project-status.md) and [acceptance checklist](CHECKLIST.md) for evidence and remaining work.

## Architecture direction

The implementation uses a React and TypeScript single-page application, Cloudflare Pages Functions, D1, and a Workers AI binding for a possible live deployment, subject to account access and free-plan verification. Static assets remain public; all authorization runs in the API. Local inference uses an explicit deterministic mock. See [system overview](docs/architecture/system-overview.md) and [decisions](docs/architecture/decisions.md). The proposed wireframe runs at `/vision/` locally. A separate static vision-only build is prepared for GitHub Pages; it contains no backend or inference behavior.

## Develop and verify

Requirements: Node.js 24+, npm 11+.

```bash
npm ci
npm run dev
```

`npm run dev` builds the app, applies D1 migrations to Wrangler's local SQLite database, and starts the Pages Functions runtime at `http://127.0.0.1:8788`. Local inference uses an explicitly labelled deterministic mock; it does not call a model. Install Chromium once with `npx playwright install chromium`. `npm run test:e2e` checks the reviewer UI using controlled API fixtures; `npm run test:e2e:fullstack` checks the built UI against local Pages Functions and D1. Both local integration paths use a clearly labelled mock, not live Workers AI. `npm run test:vision-static` builds and browser-tests the GitHub Pages vision-only artifact. `npm run verify` also checks that artifact, and runs formatting, lint, type checks, unit tests, production build, local migrations, API integration, and documentation checks.

## Public links

- Source: <https://github.com/Bepoadewale/mindcommons>
- Live demonstration: not deployed yet
- Technical video: not recorded yet
- Future-product wireframe: local route `/vision/`; GitHub Pages publication is in progress and will be a static visualization only

## Privacy, research, and governance limits

The prototype must use synthetic content only. It is not suitable for patient data, clinical decisions, or human-subject research. Demo roles are not identity verification, audit records are not tamper-proof, and a cloud inference call does not establish deletion from model weights. Application limits cap new sessions at 500/day, API requests at 60/minute/session, and model runs at 100/day; these safeguards do not guarantee account-wide free usage. Community authority, consent language, safeguarding, and benefit-sharing arrangements need to be co-designed before any real pilot. See [threat model](docs/security/threat-model.md), [privacy limitations](docs/security/privacy-limitations.md), and [community authority](docs/governance/community-authority.md).

## Contributing and license

Contributions are welcome under the [Apache License 2.0](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Changes to `main` go through pull requests and required checks.
