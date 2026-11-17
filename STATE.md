# Current execution state

Last updated: 2026-11-17

## Verified complete

- Public repository: https://github.com/Bepoadewale/mindcommons, Apache-2.0, Issues enabled, protected PR-only `main` with four required checks and no solo-approval requirement.
- PRs #1–#17 were merged through GitHub after required checks passed. PR #17 is merge `2d4d5de`; run `44059982953` passed all four required checks. Merged source branches were deleted locally and remotely. Existing DavDeploy repos and their PRs were not changed.
- Project research, Mozilla RFP alignment, architecture, governance, security, and reusable DavDeploy lessons are documented.
- Core synthetic demo implemented: community proposal/rules, individual permissions, fixed research request, deterministic fail-closed server authorization, fixed AI job, provenance/audit, hypothetical benefit commitment, isolated/resettable sessions, and public future vision.
- Dedicated Cloudflare D1 database `mindcommons-demo-d1` exists in WEUR (ID `9b9dff3c-6743-4dab-8fb9-e2cebe0196f0`) with all three migrations applied.
- Worker `mindcommons-mozilla-demo` is deployed at https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/. Chromium verified the production page and assets, `GET /api/demo`, an allowed research run calling real Workers AI (`@cf/google/gemma-4-26b-a4b-it`), and a prohibited commercial request rejected by the server. The prohibited run recorded no model ID. The D1 records are synthetic.
- Public future-product visualization: https://bepoadewale.github.io/mindcommons/ (static only, no backend behavior).
- Local verification before the current branch: 21 unit tests, 4 fixture browser tests, 3 vision browser tests, local Worker/D1 integration, full-stack browser path with an explicitly labeled mock, accessibility checks, typecheck, lint, builds, Wrangler dry run, and docs validation.
- A live Chromium recording captured a real approved inference and a denied commercial request (106.96 seconds, 1280×720); an H.264 MP4 was generated locally. This first recording is **not yet a publishable final artifact**: review showed the model returned an empty visible `content` field because its token limit was consumed by reasoning output.
- Cloudflare account contains only the dedicated MindCommons D1 and Worker created for this effort; no paid plan or unrelated DavDeploy resource was enabled or changed. The user explicitly chose to retain the broad account token in Keychain; the token value remains unprinted, uncommitted, and out of GitHub Actions.

## Active branch

`feat/live-demo-recording` contains uncommitted edits for:

- Separate production (`dist`) and GitHub Pages vision (`dist-vision`) build outputs, to prevent a vision build replacing the production deployment asset directory.
- A deployment script that builds production assets before Wrangler deploy.
- A real Chromium recording script with checks for live inference, prohibited-request denial, and browser errors.
- A `chat_template_kwargs.enable_thinking: false` setting and unit assertion so the live model provides a visible answer within the bounded output budget.
- A compact H.264 MP4 that must be replaced after deploying the corrected model setting.
- README and evidence updates; some project-state records still need final revision after the replacement recording is verified.

## Known limits

- The current deployed Worker and first recording predate the thinking-mode fix. Do not claim the corrected, non-empty model output is live until it is redeployed and checked.
- No actual community pilot, participant feedback, SRHIN endorsement, clinical validation, real benefit delivery, or patient data are involved.
- Android physical-device installation has not been checked (`adb` unavailable).
- No YouTube upload; GitHub Pages MP4 is the planned public video route after verification.
- Figma sharing was not verified; the public `/vision/` page is the honest fallback.

## Next executable task

Finish and validate the live output correction, re-record the MP4, run the local acceptance suite and build-isolation checks, update persistent records, then publish the cohesive changes through a passing PR. Verify the new video URL and live demo after merge/deploy.
