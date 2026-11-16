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

The public repository and Phase 0 evidence are being established. The application, tests, deployment, and reviewer assets are not yet implemented. See [project status](docs/fellowship/project-status.md) and [acceptance checklist](CHECKLIST.md) for verified progress.

## Architecture direction

The current decision is a React and TypeScript single-page application, Cloudflare Pages Functions, D1, and Workers AI, using only the free plan. Static assets remain public; all authorization runs in the API. See [system overview](docs/architecture/system-overview.md) and [decisions](docs/architecture/decisions.md). This is a planned design, not a deployed service.

## Develop and verify

Commands will be documented after the application and lockfile are created and validated. Do not treat these instructions as available yet.

## Public links

- Source: <https://github.com/Bepoadewale/mindcommons>
- Live demonstration: not deployed yet
- Technical video: not recorded yet
- Future-product wireframe: not published yet

## Privacy, research, and governance limits

The prototype must use synthetic content only. It is not suitable for patient data, clinical decisions, or human-subject research. Demo roles are not identity verification, audit records are not tamper-proof, and a cloud inference call does not establish deletion from model weights. Community authority, consent language, safeguarding, and benefit-sharing arrangements need to be co-designed before any real pilot. See [threat model](docs/security/threat-model.md), [privacy limitations](docs/security/privacy-limitations.md), and [community authority](docs/governance/community-authority.md).

## Contributing and license

Contributions are welcome under the [Apache License 2.0](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Changes to `main` go through pull requests and required checks.
