# Project status

**Status on 2026-11-18:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional community records and synthetic research material only.

PRs #37–#40 are merged to protected `main`; all required PR checks passed. PR #40's post-merge CI run `44192355625` and static Pages publish run `44192355348` passed. PRs #37–#40 are not deployed to the hosted Worker. Local verification for PR #40 passed `npm run verify`, 8/8 reviewer browser tests, and full-stack Worker/D1 browser acceptance with mock inference.

## What works

- Public application: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. Worker version `b01d3f96-d72a-41a2-b751-88dff3c7adc9` serves the release after PR #34. D1 migrations 0005 and 0006 are applied to the dedicated `mindcommons-demo-d1` database (`9b9dff3c-6743-4dab-8fb9-e2cebe0196f0`). The Worker has D1 and Workers AI bindings and uses the `workers.dev` hostname only.
- A fresh production session executed real Workers AI inference for an allowed synthetic request. Contributor B's withdrawal changed the v1 result to two eligible records (A and C). A fictional representative approved policy v2; the identical request was rejected server-side before inference because one contributor had withdrawn. Local deterministic concurrency tests verify that output is withheld if authorization changes during inference.
- The synthetic Community AI Agreement has a machine-readable JSON Schema, shared TypeScript/Zod contract, and deterministic reference evaluator. The MindCommons API uses the evaluator; a separate minimal Worker example also consumes the agreement in tests. The agreement cannot control services that ignore it, uncontrolled dataset/model copies, or already released results.
- A fresh live benefit scenario recorded the fictional community representative's agreement, the fictional research team's acceptance, a fixed synthetic evidence marker, and an accepted community review. It makes no real payment or delivery claim.
- Main CI run `44134751119` passed all four required checks after PR #34. Local verification passed 38 unit tests, six reviewer browser tests, three static vision tests, local Worker/D1 integration, and output-release concurrency cases. Mocked local inference is not counted as a live model call.
- PR #40 local verification on 2026-11-18 passed `npm run verify` (55 unit tests plus local Worker/D1 integration), `npm run test:e2e` (8/8), `npm run test:e2e:fullstack`, and `npm run test:agreement` (27/27). Tests use a deterministic mock where AI is invoked. The preview makes no AI call; production changes are not deployed.
- Android 16 Google Play emulator checks verified the Chrome install prompt, launcher shortcut and standalone launch. No physical-device test has been done.

## Public evidence

- Source: <https://github.com/Bepoadewale/mindcommons>
- Live backend and interactive demo: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>
- Static future-product wireframe (no API or AI): <https://bepoadewale.github.io/mindcommons/>
- Captioned video: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4> and the independent Pages copy <https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4>. Both returned unauthenticated HTTPS 200 with `video/mp4`. The downloaded Pages copy was decoded and checked at 92.84 seconds, 1920×1080, 25 fps, H.264.
- Original uncaptioned video, preserved unchanged: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4> and <https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4>.
- PR #34 merged at `9a31042feb34987bbae3c9b10140a900435e07bd`. Its required checks passed in PR run `44134264751`; post-merge CI `44134751119` and Pages publish `44134751142` succeeded. Local and remote source branches were deleted.
- No YouTube upload has happened. The project owner may later provide a YouTube URL.

## Limits and risks

- No community pilot, participant feedback, SRHIN endorsement, clinical validation, real benefit delivery, or patient data is involved.
- Demo seats are not authenticated identities or evidence of legitimate community authority. Agreements can only constrain participating services that implement and honor them.
- Read-only preflight confirmed the dedicated Cloudflare account, Worker and D1, but account subscription/billing reads returned HTTP 403 for both configured tokens. Current billing/free-tier status is therefore unverified; no deployment or migration was attempted. The official subscription-list API requires `Billing Read` or `Billing Write`. Free model eligibility alone does not verify account billing status. See [technical validation](../research/technical-validation.md).
- The new video is silent with burned-in explanatory on-screen captions. These are not a transcript, narration, or closed captions. The project owner plans to upload an MP4 to YouTube; no upload is claimed.
- Figma sharing was not verified; the static `/vision/` page remains the honest fallback.

## Next work

The hosted Worker predates PRs #37–#40; migrations 0007 and 0008 are pending remotely. Remote migration and deployment are blocked until current billing/free-tier status is verifiably read and exact-resource/no-charge preflight passes. Do not imply benefit gating, receipts or the reviewer preview are live on the Worker. Remaining owner-dependent work includes obtaining billing-read access or confirming billing in Cloudflare, and optionally uploading the MP4 to YouTube. Physical Android testing is optional. Community co-design, ethics/safeguarding review and any pilot depend on an authorized host relationship and are not claimed as completed. The Mozilla application remains separate.
