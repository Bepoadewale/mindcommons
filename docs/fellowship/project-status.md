# Project status

**Status on 2026-11-18:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional community records and synthetic research material only.

PRs #37–#45 are merged to protected `main`; required checks passed. PR #45's post-merge CI run `44241005421` and static Pages publish run `44241005379` passed. PRs #37–#40 are deployed on the dedicated Worker, and their live behavior was checked using synthetic sessions.

## What works

- Public application: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. Worker version `a12cd688-9975-44a6-a3ee-9c8c2dfe4974` serves the release after PRs #37–#40. D1 migrations 0001–0008 are applied to the dedicated `mindcommons-demo-d1` database (`9b9dff3c-6743-4dab-8fb9-e2cebe0196f0`). The Worker has D1 and Workers AI bindings and uses the `workers.dev` hostname only.
- A fresh production session executed real Workers AI inference for an allowed synthetic request. Contributor B's withdrawal changed the v1 result to two eligible records (A and C). A fictional representative approved policy v2; the identical request was rejected server-side before inference because one contributor had withdrawn. Local deterministic concurrency tests verify that output is withheld if authorization changes during inference.
- The synthetic Community AI Agreement has a machine-readable JSON Schema, shared TypeScript/Zod contract, and deterministic reference evaluator. The MindCommons API uses the evaluator; a separate minimal Worker example also consumes the agreement in tests. The agreement cannot control services that ignore it, uncontrolled dataset/model copies, or already released results.
- A fresh live benefit scenario recorded the fictional community representative's agreement, the fictional research team's acceptance, a fixed synthetic evidence marker, and an accepted community review. It makes no real payment or delivery claim.
- Main CI run `44134751119` passed all four required checks after PR #34. Local verification passed 38 unit tests, six reviewer browser tests, three static vision tests, local Worker/D1 integration, and output-release concurrency cases. Mocked local inference is not counted as a live model call.
- PR #40 local verification on 2026-11-18 passed `npm run verify` (55 unit tests plus local Worker/D1 integration), `npm run test:e2e` (8/8), `npm run test:e2e:fullstack`, and `npm run test:agreement` (27/27). Tests use a deterministic mock where AI is invoked. The preview makes no AI call; live behavior has since been separately checked.
- Production follow-up verified the new release without further test inference: a required-benefit request was denied with HTTP 403 before inference; a session-scoped denial receipt was available to that session and returned 404 to an independently initialized session. One explicitly submitted synthetic job completed through Workers AI, and its receipt records live inference, policy v2, accepted required benefit, three contributions, and released output. No further live model call is needed for acceptance evidence.
- The latest 92.40-second 1920×1080 H.264 video at <https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4> is a fresh browser capture of the hosted preview, benefit denial, actual receipt and renewed eligibility after fictional acceptance. It makes no AI call. GitHub Pages publishes this fallback; the existing Worker recordings remain unchanged.
- Android 16 Google Play emulator checks verified the Chrome install prompt, launcher shortcut and standalone launch. No physical-device test has been done.

## Public evidence

- Source: <https://github.com/Bepoadewale/mindcommons>
- Live backend and interactive demo: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>
- Static future-product wireframe (no API or AI): <https://bepoadewale.github.io/mindcommons/>
- Captioned video: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4> and the independent Pages copy <https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4>. Both returned unauthenticated HTTPS 200 with `video/mp4`. The downloaded Pages copy was decoded and checked at 92.84 seconds, 1920×1080, 25 fps, H.264.
- Latest no-inference policy and benefit walkthrough: <https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4>. This static Pages asset is separate from the older video files served by the production Worker.
- Original uncaptioned video, preserved unchanged: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4> and <https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4>.
- PR #34 merged at `9a31042feb34987bbae3c9b10140a900435e07bd`. Its required checks passed in PR run `44134264751`; post-merge CI `44134751119` and Pages publish `44134751142` succeeded. Local and remote source branches were deleted.
- No YouTube upload has happened. The project owner may later provide a YouTube URL.

## Limits and risks

- No community pilot, participant feedback, SRHIN endorsement, clinical validation, real benefit delivery, or patient data is involved.
- Demo seats are not authenticated identities or evidence of legitimate community authority. Agreements can only constrain participating services that implement and honor them.
- The owner-shared Cloudflare screenshots show Workers Free active and Workers Paid not subscribed; the billable-usage page showed “No data” at capture time before deployment. The dashboard refreshes usage daily, so do not treat this as proof of zero post-deployment usage. No paid plan or add-on was enabled. The configured model and D1 are within published Free allowances, but quotas are shared and requests may fail on quota exhaustion. See [technical validation](../research/technical-validation.md).
- The new video is silent with burned-in explanatory on-screen captions. These are not a transcript, narration, or closed captions. The project owner plans to upload an MP4 to YouTube; no upload is claimed.
- Figma sharing was not verified; the static `/vision/` page remains the honest fallback.

## Next work

The production release includes the benefit gate, decision receipts, agreement conformance support and guided no-inference preview. The latest video documents these new paths; the previous video separately shows a real synthetic inference. The screenshots document Workers Free as active and Workers Paid not subscribed, but the billable-usage “No data” view predates deployment and is not a zero-charge guarantee. Do not enable a paid tier if free quota is exhausted. Remaining owner-dependent work includes an optional YouTube upload and physical Android-device testing. Community co-design, ethics/safeguarding review and any pilot depend on an authorized host relationship and are not claimed as completed. The Mozilla application remains separate.
