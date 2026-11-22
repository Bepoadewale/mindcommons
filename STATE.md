# Current project state

Last updated: 2026-11-22

## In plain English

MindCommons is an independently built public prototype. It uses made-up community members and synthetic research text to show how a server can check a community rule, each person's permission, and agreed benefit conditions before a fixed AI task. It is not an established cooperative, an SRHIN project, community-validated, clinical, or a real pilot.

## Latest documentation update

PR #50, [explain MindCommons in plain English](https://github.com/Bepoadewale/mindcommons/pull/50), merged as `d6a1baa8f6c1660f85932afe216bbc7581761bf6`. It rewrote the README and key project, reviewer, governance, privacy and fellowship pages around a concrete example. It also added a documentation index and glossary. The change did not alter the app, call AI or modify Cloudflare resources. Local `npm run verify` passed, including 55 unit tests, a local Worker/database check using a test substitute, and documentation-link checks. All required PR checks and the post-merge CI and Pages publication passed.

## Earlier research update

PR #49, [add GENSCORE and lived-experience guide context](https://github.com/Bepoadewale/mindcommons/pull/49), merged to protected `main` as `d706db10dd667d709b829e707acebadda37ab99a`. All required PR checks passed after a rerun, and the post-merge CI and static Pages publication passed. It updated two research pages only.

## What has already been shown

- The public [demo](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/) uses fictional records only.
- A bounded live AI operation has run on synthetic text.
- Withdrawing one fictional contributor's permission can remove that person's record from an otherwise allowed request.
- A different fictional community rule changes the outcome for the same request.
- A required fictional benefit can block a request until it is accepted.
- The system can withhold a result if relevant rules change while a model is working. Tests cover this; it cannot undo text already sent to an outside model provider.
- A receipt explains why a request passed or was denied. It is limited to the visitor's temporary session.
- An independent small Worker example and local conformance tests show how another participating service could use the agreement.

## Important unknowns

There has been no SRHIN collaboration, community feedback, user research, endorsement, pilot, clinical validation, or real benefit delivery. The demo roles do not verify real identities or authority. The agreement cannot control a service that does not use it or copies outside participating services.

## Next steps

Keep public explanations clear as the project changes, and update evidence when behavior or sources change. Keep the fellowship application separate; the applicant writes and submits personal answers in their own words.
