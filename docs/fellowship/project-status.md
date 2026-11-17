# Project status

**Status on 2026-11-17:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional Nigerian community records and synthetic mental-health research material only.

The public application is deployed at <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. Its dedicated Cloudflare Worker Static Assets service uses the `mindcommons-demo-d1` D1 database and the Workers AI binding. Direct API and Chromium journeys have verified session isolation, a policy/individual-permission controlled permitted research request, a real Cloudflare Workers AI model call, and a server-side denial of commercial advertising use. The denied run has no model ID. No paid plan or unrelated DavDeploy resource was enabled or changed.

**Known finalization item:** live review of the first production recording showed Gemma spent its 180-token completion limit on a reasoning channel and returned an empty visible answer. The returned response contained synthetic-only content, but internal reasoning is not part of the user-facing result. The current feature branch adds Cloudflare's documented `chat_template_kwargs.enable_thinking: false` setting; it still needs local checks, PR review/merge, deployment, a new live call, and a replacement screen recording before the video is publicized. The build pipeline is also being adjusted so the GitHub Pages vision-only build cannot overwrite the Cloudflare production artifact.

The independent future-product visualization is public at <https://bepoadewale.github.io/mindcommons/>. It is a static eight-screen wireframe with no API or AI behavior. A 106.96-second production screen capture exists locally and has been converted to H.264 MP4; it must be re-recorded after the model-output fix and opened publicly after the Pages workflow publishes it.

Local CI and test evidence before the latest model-output fix includes 21 unit tests, 4 fixture-backed browser tests, 3 vision browser tests, local Worker + D1 integration, a full-stack browser journey using an explicitly labeled deterministic mock, accessibility scans, type checks, lint, production/vision builds, and documentation validation. The new setting has a focused unit assertion but the full suite has not yet been rerun on the active branch. Physical Android installation is unverified.

The owner chose to keep the broad account-scoped Cloudflare token in macOS Keychain. Its value has never been printed or committed and is not used in GitHub Actions. The dedicated Worker and D1 are the only MindCommons Cloudflare resources; no paid plan was enabled. The public app is synthetic-only and is not suitable for patient data, clinical decisions, or human-subject research. Real community authority, consent, safeguarding, and benefit-sharing would need participant-led co-design and relevant ethics review before any pilot.

## Next executable work

1. Run the refreshed bounded Workers AI call and confirm a non-empty user-facing result with reasoning disabled.
2. Re-record and validate the MP4 from the corrected live UI.
3. Run the local acceptance suite and confirm production/vision build output separation.
4. Update the status/evidence documents, open and merge a PR after all checks pass, then verify the public Pages video and live app again.
