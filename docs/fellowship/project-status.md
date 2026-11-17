# Project status

**Status on 2026-11-17:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional community records and synthetic research material only.

## What works

- Public application: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. Worker version `b01d3f96-d72a-41a2-b751-88dff3c7adc9` serves the release after PR #34. D1 migrations 0005 and 0006 are applied to the dedicated `mindcommons-demo-d1` database (`9b9dff3c-6743-4dab-8fb9-e2cebe0196f0`). The Worker has D1 and Workers AI bindings and uses the `workers.dev` hostname only.
- A fresh production session executed real Workers AI inference for an allowed synthetic request. Contributor B's withdrawal changed the v1 result to two eligible records (A and C). A fictional representative approved policy v2; the identical request was rejected server-side before inference because one contributor had withdrawn. Local deterministic concurrency tests verify that output is withheld if authorization changes during inference.
- The synthetic Community AI Agreement has a machine-readable JSON Schema, shared TypeScript/Zod contract, and deterministic reference evaluator. The MindCommons API uses the evaluator; a separate minimal Worker example also consumes the agreement in tests. The agreement cannot control services that ignore it, uncontrolled dataset/model copies, or already released results.
- A fresh live benefit scenario recorded the fictional community representative's agreement, the fictional research team's acceptance, a fixed synthetic evidence marker, and an accepted community review. It makes no real payment or delivery claim.
- Main CI run `44134751119` passed all four required checks after PR #34. Local verification passed 38 unit tests, six reviewer browser tests, three static vision tests, local Worker/D1 integration, and output-release concurrency cases. Mocked local inference is not counted as a live model call.
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
- A prior same-day Cloudflare preflight reported zero active paid subscriptions. A fresh subscription-list API request returned HTTP 403 `Authentication error`, so billing status could not be re-read through that endpoint. No plan, subscription, add-on, or paid resource was created or changed in these deployments. The configured model is listed as Workers Free eligible. Free quotas are shared account-wide.
- The new video is silent with burned-in explanatory on-screen captions. These are not a transcript, narration, or closed captions. The project owner plans to upload an MP4 to YouTube; no upload is claimed.
- Figma sharing was not verified; the static `/vision/` page remains the honest fallback.

## Next work

The requested governance, Community AI Agreement, fictional benefit workflow, reviewer video, and production evidence are implemented and verified. Optional future work includes a physical Android device check, a YouTube upload if desired, and community-led co-design, ethics/safeguarding review and any pilot. These require real external collaboration and are not claimed as completed. The Mozilla application itself remains separate; these documents are technical evidence and planning material, not personal application responses.
