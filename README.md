# MindCommons

**A Community-Owned AI Model Cooperative** is a working subtitle for this independent, open-source prototype. MindCommons explores a practical question: can communities set rules for how their contributions are used in AI research, and can a participating service check those rules before it acts?

## The problem, in a simple example

Imagine a community shares fictional examples to help researchers study mental health. The community agrees that an approved research team may use them for community wellbeing research, but not for advertising. Each person also has a separate choice about their own contribution. If one person withdraws permission, that person's record should be left out. If the research team has not accepted a required community benefit, the job should wait. A software service can check these conditions before it sends anything to an AI model.

That is the kind of control MindCommons demonstrates. It does not create community authority by itself. People affected by a real project would need to decide how rules are made, who may speak for the group, and what benefits are fair.

## What works today

- The public demo uses fictional people and synthetic research text only. It is not a real pilot, health service, or clinical tool.
- A visitor can see a community rule and each fictional contributor's separate permission.
- The server checks a fixed research request against the rule, each relevant permission, allowed model and task, and any required benefit terms.
- An approved request can run a bounded AI task on synthetic text. A request that breaks the rules is denied before the model is called.
- If relevant rules or permissions change while a model task is running, the service can withhold the result. This cannot undo information already sent to the model provider.
- A visitor can inspect and download a session-only decision receipt explaining what was allowed or denied. It does not contain raw research text or model output.
- A portable, machine-readable agreement and a small example show how another participating service could use the same checks.

The agreement cannot control a service that does not use it, copies of data or models outside a participating service, or results that have already been shared.

## Try it and inspect the evidence

- [Open the live demo](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/)
- [Read the reviewer guide](docs/demo/reviewer-guide.md)
- [Watch the policy and benefit walkthrough](https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4). This 1080p recording shows a real denial and decision receipt; it does not run AI.
- [Watch the captioned recording of a synthetic AI run](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4). It shows a separate, bounded model call using fictional material.
- [Explore the future-product design](https://bepoadewale.github.io/mindcommons/). This is a static visual guide, not a working backend.
- [Browse the source code](https://github.com/Bepoadewale/mindcommons)

All community members, research requests and benefits in the demo are fictional. No SRHIN partnership, community approval, clinical validation or real benefit delivery is claimed.

## How the demo works

The website is built with React and TypeScript. A Cloudflare Worker runs the server-side checks, D1 stores short-lived fictional demo records, and Workers AI runs the approved fixed task. “Server-side” means the checks happen in the service that controls the request, not only in the visitor's browser. The AI model does not decide who is allowed to run research; the rule checks are fixed software logic.

Most tests use a clearly labelled mock instead of calling an AI model. A mock is a test substitute. It helps check the software but is not evidence of a live model run. The live run is separately described in the [project status](docs/fellowship/project-status.md).

## Run and check it locally

Requirements: Node.js 24 or later and npm 11 or later.

```sh
npm ci
npm run dev
```

The local site opens at `http://127.0.0.1:8788`. Local inference uses a deterministic mock and does not call a model. Install Chromium once with `npx playwright install chromium`.

Useful checks:

```sh
npm run verify
npm run test:e2e
npm run test:e2e:fullstack
npm run test:agreement
```

`npm run verify` runs formatting, code checks, automated tests, a local database setup, a production build and documentation checks. Browser tests exercise the website. The agreement tests check that the same rules produce the same answer in MindCommons and the separate Worker example. These local tests do not use live AI. See the [portable example guide](examples/portable-ai-worker/README.md) for more.

## Privacy and limits

Do not enter personal information in the demo. It is for synthetic material only and is not suitable for patient records, clinical decisions or human-subject research. The browser does not save demo research data in its local storage. Demo sessions expire and can be reset. The hosted AI task sends selected synthetic text to Cloudflare, an outside service. Withholding a result after a change does not recall text already sent. The demo's switchable roles are fictional and do not verify anyone's identity or authority.

Before any real-world use, the project would need community-led decisions, appropriate ethics and safeguarding review, legal and privacy advice, and a secure design for the specific research. See the [privacy limits](docs/security/privacy-limitations.md), [threat model](docs/security/threat-model.md), [community decision guide](docs/governance/community-authority.md), and [proposed SRHIN fellowship roadmap](docs/fellowship/srhin-embedded-roadmap.md).

## Project stage

MindCommons is an independent technical prototype. It is not an established cooperative, an SRHIN project, a community-validated product or an awarded Mozilla project. The proposed fellowship is an opportunity to explore whether and how the idea should change through authorized community co-design. Read the [plain-language project status](docs/fellowship/project-status.md) and [technical evidence summary](docs/fellowship/technical-evidence-summary.md).

## Contributing and license

Contributions are welcome under the [Apache License 2.0](LICENSE). See [how to contribute](CONTRIBUTING.md) and [security reporting](SECURITY.md). Changes to `main` go through pull requests and required checks.
