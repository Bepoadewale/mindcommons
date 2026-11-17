# Project status

**Status on 2026-11-17:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional Nigerian community records and synthetic mental-health research material only.

The public application is deployed at <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. Its dedicated Cloudflare Worker Static Assets service uses the `mindcommons-demo-d1` D1 database and the Workers AI binding. Chromium has verified session isolation, a policy/individual-permission controlled permitted research request with visible output from real Cloudflare Workers AI inference, and a server-side denial of commercial advertising use. The denied run has no model ID. No paid plan or unrelated DavDeploy resource was enabled or changed.

**Known finalization item:** a first model call without the reasoning setting spent its bounded output on reasoning and returned an empty visible answer. The production Worker now uses Cloudflare's documented `chat_template_kwargs.enable_thinking: false`; a live browser capture confirms a non-empty answer. The active branch further strips model reasoning metadata, treats empty output as failure, improves result readability, and links the landing page to the MP4. These changes still need CI, PR merge, redeployment, a replacement recording, and public URL checks.

The independent future-product visualization is public at <https://bepoadewale.github.io/mindcommons/>. It is a static eight-screen wireframe with no API or AI behavior. A 90.44-second, 1920×1080 production screen capture exists at `apps/web/public/mindcommons-demo.mp4`, encoded as H.264 at 3.6 MB. It captures real output and policy denial; the upcoming response change only removes metadata and formats the same user-facing output. Merge/deploy the artifact and site link, then verify the public media URL.

Local branch checks include 23 unit tests, 4 fixture-backed browser tests, 3 vision browser tests, local Worker + D1 integration, a full-stack browser journey using an explicitly labeled deterministic mock, accessibility scans, type checks, lint, production/vision builds, and documentation validation. The live recording script requires actual non-empty Workers AI output and denies the commercial request. Physical Android installation is unverified.

The owner chose to keep the broad account-scoped Cloudflare token in macOS Keychain. Its value has never been printed or committed and is not used in GitHub Actions. The dedicated Worker and D1 are the only MindCommons Cloudflare resources; no paid plan was enabled. The public app is synthetic-only and is not suitable for patient data, clinical decisions, or human-subject research. Real community authority, consent, safeguarding, and benefit-sharing would need participant-led co-design and relevant ethics review before any pilot.

## Next executable work

1. Run the refreshed bounded Workers AI call and confirm a non-empty user-facing result with reasoning disabled.
2. Re-record and validate the MP4 from the corrected live UI.
3. Run the local acceptance suite and confirm production/vision build output separation.
4. Update the status/evidence documents, open and merge a PR after all checks pass, then verify the public Pages video and live app again.
