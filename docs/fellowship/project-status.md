# Project status

**Status on 2026-11-17:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional community records and synthetic research material only.

## What works

- Public application: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. On 2026-11-17 the dedicated Worker was deployed as version `a4471379-e78c-46b9-9313-0f8c8250038e`; D1 migrations 0005 and 0006 were applied to the dedicated `mindcommons-demo-d1` database (`9b9dff3c-6743-4dab-8fb9-e2cebe0196f0`). The Worker has D1 and Workers AI bindings and uses the `workers.dev` hostname only.
- A fresh production session executed real Workers AI inference for an allowed synthetic request. Contributor B's withdrawal changed the v1 result to two eligible records (A and C). A fictional representative approved policy v2; the identical request was rejected server-side before inference because one contributor had withdrawn. Local deterministic concurrency tests verify that output is withheld if authorization changes during inference.
- The synthetic Community AI Agreement has a machine-readable JSON Schema, shared TypeScript/Zod contract, and deterministic reference evaluator. The MindCommons API uses the evaluator; a separate minimal Worker example also consumes the agreement in tests. The agreement cannot control services that ignore it, uncontrolled dataset/model copies, or already released results.
- A fresh live benefit scenario recorded the fictional community representative's agreement, the fictional research team's acceptance, a fixed synthetic evidence marker, and an accepted community review. It makes no real payment or delivery claim.
- Main CI run `44128935139` passed all four required checks: `validate`, `verify`, `browser-acceptance`, and `secret-scan`. Local verification covers 38 unit tests, six reviewer browser tests, three static vision tests, local Worker/D1 integration, and output-release concurrency cases. Mocked local inference is not counted as a live model call.
- Android 16 Google Play emulator checks verified the Chrome install prompt, launcher shortcut and standalone launch. No physical-device test has been done.

## Public evidence

- Source: <https://github.com/Bepoadewale/mindcommons>
- Live backend and interactive demo: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>
- Static future-product wireframe (no API or AI): <https://bepoadewale.github.io/mindcommons/>
- New captioned video (92.84 seconds, 1920×1080, 25 fps H.264) and original uncaptioned recording are checked in separately. The video PR updates the landing page and publishes both assets to the Worker and Pages fallback; public availability must be rechecked after merge before treating the new URLs as verified.
- Earlier original recording remains available at <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4> and <https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4>.
- No YouTube upload has happened. The project owner may later provide a YouTube URL for a landing-page PR.

## Limits and risks

- No community pilot, participant feedback, SRHIN endorsement, clinical validation, real benefit delivery, or patient data is involved.
- Demo seats are not authenticated identities or evidence of legitimate community authority. Agreements can only constrain participating services that implement and honor them.
- The account's prior same-day preflight reported zero active paid subscriptions. A fresh subscription-list API request in this session returned HTTP 403 `Authentication error`, so current billing status could not be re-read through that API. Deployment did not change a plan or create a paid resource; the configured model is listed as Workers Free eligible. Free quotas are shared account-wide.
- The video is silent with burned-in explanatory on-screen captions. These are not a transcript, narration, or closed captions. The project owner plans to upload the MP4 to YouTube; no upload is claimed.
- Figma sharing was not verified; the static `/vision/` page remains the honest fallback.

## Next executable work

Finish the video-and-evidence PR, verify all required CI checks, wait for the GitHub Pages publish, then open the updated Worker and Pages video links unauthenticated and verify HTTPS 200, `video/mp4`, duration and dimensions. Record the PR, run IDs, deployed result and source-branch cleanup in `STATE.md`, `CHECKLIST.md`, and `SESSION_LOG.md`. The Mozilla application itself remains separate; these are factual technical materials, not personal application responses.
