# Project checklist

This checklist shows what the prototype has demonstrated and what still needs real-world decisions. A checked software item does not mean a community has approved or tested the idea.

**Key:** [x] checked with evidence; [~] underway; [ ] not yet done or depends on future work.

## In plain English

The software checks a fictional community rule, each person's permission and any required benefit agreement before it sends synthetic text to an AI model. Automated and live checks are recorded separately. No real health data, participants or community approval are involved.

For the reviewer links, begin with the [README](README.md), [demo guide](docs/demo/reviewer-guide.md) and [project status](docs/fellowship/project-status.md).

## Fellowship-strengthening work

- [x] A fictional benefit can be required before a research request is allowed.
- [x] A result can be withheld if required benefit facts change while the model is working.
- [x] The demo explains fictional permission and withdrawal, and documents governance choices that real communities must decide.
- [x] A session-only decision receipt and portable agreement tests are in place.
- [x] A guided preview explains policy outcomes without calling AI.
- [x] The production release and shared billing screenshots were recorded. The screenshots do not guarantee future usage will stay within free allowances.

## Repository and tests

- [x] Public Apache-2.0 repository; changes to `main` require pull requests and automated checks.
- [x] Merged changes use protected `main`; source branches were removed after merging.
- [x] Automated checks cover permissions, policy changes, benefits, output withholding, browser behavior and session separation.
- [x] Test runs using a mock are not counted as live AI evidence.
- [x] Pull request #49 added the Wellcome GENSCORE and SRHIN co-design-guide sources to the research notes.

## What the prototype demonstrates

- [x] Each fictional contribution has its own purpose-specific permission, expiry, status and version.
- [x] Withdrawing one contributor's permission changes which synthetic records are eligible.
- [x] A different fictional policy changes the result for the same request.
- [x] Required benefit agreement can block a request before AI.
- [x] The portable agreement has a machine-readable format and fixed evaluator, used by MindCommons and tested in a separate Worker example.
- [x] The system checks policy and permission again before releasing results.
- [x] A live bounded AI request and separate denied request were checked in production using synthetic data.
- [x] The decision receipt is limited to its own session and excludes raw text and model output.

## Hosting and safety

- [x] The app uses separate MindCommons hosting and database resources. DavDeploy infrastructure was not changed.
- [x] Owner-shared screenshots showed the Workers Free plan active and Workers Paid not subscribed. A “No data” usage page was captured before deployment and is not proof of zero later usage.
- [x] No paid plan or add-on was enabled. If a free allowance is unavailable, the demo may fail; do not enable a paid tier.
- [x] The public demo works without the owner's Mac running.
- [x] Android 16 emulator install and launch were checked; a physical Android phone has not been tested.

## What remains open

- [ ] No user research, community validation, SRHIN endorsement, partnership, clinical testing or pilot is claimed.
- [ ] Real governance, consent, privacy, benefits and complaint processes must be shaped with affected people through an authorized process.
- [ ] Any work with people or real data needs appropriate host permission, ethics and legal review, safeguarding and privacy/security protections.
- [ ] The project owner may upload the video to YouTube later; no upload is claimed.
- [ ] Personal fellowship answers must be written and submitted by the applicant. Technical notes are not application answers.
