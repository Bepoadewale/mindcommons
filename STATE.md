# Current execution state

Last updated: 2026-11-17

## Verified complete

- Public repository: https://github.com/Bepoadewale/mindcommons; Apache-2.0, Issues enabled, protected PR-only `main`, required checks `validate`, `verify`, `browser-acceptance`, and `secret-scan`; no solo-approval rule.
- PRs #1–#33 merged through GitHub. PRs #31–#33 are the latest governance, portable Community AI Agreement, and benefit-accountability improvements. All four PR checks passed; main CI run `44128935139` passed. Merged source branches were deleted locally and remotely.
- CI verification includes 38 unit tests, six reviewer browser tests, three vision tests, local Worker/D1 integration and mocked concurrency/output-withholding paths. The local full-stack browser tests clearly identify mocked AI and are not evidence of live inference.
- D1 `mindcommons-demo-d1` (ID `9b9dff3c-6743-4dab-8fb9-e2cebe0196f0`) has all six migrations. On 2026-11-17, only pending migrations 0005 and 0006 were applied. Dedicated Worker `mindcommons-mozilla-demo` is deployed to https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/ at version `a4471379-e78c-46b9-9313-0f8c8250038e` with D1 and Workers AI bindings.
- Live production verification used a fresh synthetic session: actual Workers AI returned non-empty text; after contributor B withdrew, only contributions A and C were sent under policy v1; policy v2 then denied the identical request before inference. The same session recorded fictional benefit agreement, research-team acceptance, evidence and accepted community review. Output-release withholding during concurrent authorization change is verified by deterministic local integration tests, not a live race.
- Current Cloudflare account and exact MindCommons resources were confirmed before mutations. A prior same-day preflight reported zero active paid subscriptions. The subscription-list API returned HTTP 403 `Authentication error` on this session, so current billing state could not be re-read through that endpoint; no plan/add-on/paid resource was created or changed. The selected model is documented by Cloudflare as eligible for Workers Free. No DavDeploy resource was modified.
- Existing public video stays intact at https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4 and https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4. The public future-product wireframe remains https://bepoadewale.github.io/mindcommons/.
- Research comparison was updated to acknowledge overlaps with PySyft, Mozilla Data Collective and Flower; it positions the Community AI Agreement as an experiment, not a novelty claim or integration.

## Work in progress: `feat/live-demo-evidence-refresh`

- Recorder now produces a real production capture with on-screen explanatory captions, live inference, contributor B withdrawal/filtering, policy-v2 denial of the same request, full synthetic benefit workflow, and a public GitHub repo end card. Latest recorder run passed: 92.84 seconds, 1920×1080, 25 fps, no browser errors, real AI result and expected denials.
- Encoded video at `apps/web/public/mindcommons-demo-captioned.mp4` (H.264, CRF 18, 4,609,951 bytes). The existing uncaptioned recording is unchanged. The new text is burned-in explanatory copy on a silent video; it is not speech transcription or closed captions.
- The landing page now links to both new captioned video and preserved original. Vision build validator and Playwright link checks include both assets. Reviewer, RFP, technical validation and project status documentation are being updated.
- Public Worker and GitHub Pages copies of the captioned video are not yet deployed. Current deployed page still uses the pre-refresh build until this PR is merged and deployed.

## Next executable tasks

1. Run formatting, `npm run verify`, `npm run test:e2e`, and `npm run test:e2e:fullstack`; probe both local video files with `ffprobe` and perform a final docs/status review.
2. Commit this cohesive video-and-evidence change on the current feature branch, push it, and open a PR. Do not push to `main`.
3. Watch only that PR's required checks; fix failures and merge only when all pass. Then delete local and remote source branches and sync `main`.
4. Wait for the Pages publish and verify the new Worker and Pages MP4s unauthenticated over HTTPS (`200`, `video/mp4`, 1920×1080, ~92.84 seconds). Verify that the live landing page links to both.
5. Record PR/run/version/URL evidence in `STATE.md`, `CHECKLIST.md`, `SESSION_LOG.md`, and final evidence docs through PR workflow.

## Open limits

- No real community pilot, user/participant feedback, SRHIN endorsement, clinical validation, or patient data.
- Physical Android device has not been tested; Android 16 emulator install and launch passed.
- Figma sharing is unverified; `/vision/` is the public static fallback.
- The project owner plans to upload the MP4 to YouTube later; no upload has occurred.
- Fellowship application responses must remain the applicant's own voice; only technical evidence and planning materials are being prepared.
