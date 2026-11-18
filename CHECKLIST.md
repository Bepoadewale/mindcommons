# Acceptance checklist

Legend: `[x]` verified; `[~]` in progress; `[ ]` not done or optional future work.

## Fellowship-strengthening follow-up

- [x] PR #37 merged: benefit obligations are optional, explicit authorization prerequisites in Agreement v2; Agreement v1 meaning is retained. The initial policy remains permissive. Local API integration denies before inference until community agreement and research-team acceptance; the same request can proceed after acceptance.
- [x] PR #37 merged: conditional result release checks that required benefit facts remain unchanged during model execution; delayed-inference integration verified withholding. Production benefit-gate denial was also verified; no live race was attempted.
- [x] PR #38 merged: consent explanation, governance design framework, data-flow audit and cross-session API tests. Required checks and post-merge CI/Pages publication passed.
- [x] PR #39 merged: portable Agreement v2 conformance and session-scoped decision receipt. Required checks, post-merge CI and Pages publish passed; receipt behavior is live.
- [x] PR #40 merged: seven-step reviewer journey and deterministic no-inference policy preview. 8/8 browser tests pass, including withdrawal, policy and benefit changes, keyboard navigation and scoped accessibility. AI execution remains a separate user action.
- [x] PR #40 post-merge CI run `44192355625` and Pages publish run `44192355348` passed; the guided preview is deployed.
- [x] PR #44 reconciled the production release and owner-shared billing screenshots through the PR workflow; four required checks, post-merge CI and Pages publish passed.

## Repository and quality

- [x] Public Apache-2.0 repository and protected PR-only `main`; four required checks; no solo-approval blocker.
- [x] PRs #1–#46 merged after required checks passed; merged source branches cleaned up locally and remotely. PR #41 post-merge CI run `44194854283` and Pages run `44194852519` passed; PR #42 post-merge CI run `44196877121` and Pages run `44196877364` passed; PR #44 post-merge CI run `44239516814` and Pages run `44239516893` passed; PR #45 post-merge CI run `44241005421` and Pages run `44241005379` passed; PR #46 post-merge CI run `44261338378` and Pages run `44261338331` passed.
- [x] PR #34 checks passed in run `44134264751`; post-merge CI run `44134751119` and Pages publish run `44134751142` succeeded.
- [x] Previous main `npm run verify` passed with 38 unit tests and Worker/D1 integration; PR #40 `npm run verify` passed with 55 unit tests and local integration.
- [x] PR #40 `npm run test:e2e` passed 8/8; `npm run test:e2e:fullstack` and `npm run test:agreement` passed with explicitly labeled mock AI; `npm run test:vision-static` passed 3/3 as part of verify.

## Governance and technical contribution

- [x] Every synthetic contribution has a separate purpose-specific permission, expiry, status and version.
- [x] Live withdrawal of contributor B under policy v1 permitted only records A and C.
- [x] Approving v2 changed the outcome for the identical request and blocked it server-side before inference.
- [x] Output authorization is rechecked; local integration cases verify concurrent withdrawal/policy changes withhold the result and record the event.
- [x] Portable Community AI Agreement JSON Schema and deterministic evaluator are used by MindCommons and a separately testable minimal Worker example.
- [x] Agreement boundaries are explicit: it cannot control systems that ignore it, uncontrolled copies, or already released outputs.
- [x] Real Workers AI inference and denied request were verified in production using synthetic content.
- [x] Live benefit gate denied before inference while required terms were absent. After agreement and team acceptance, one synthetic operation completed; a receipt recorded the outcome. A separate session could not retrieve the first session's receipt.
- [x] Benefit workflow completed in production synthetic session: community agreement, team acceptance, evidence marker and community review.

## Hosting and safety

- [x] Exact dedicated Worker and D1 were confirmed; migrations 0001–0008 applied; Worker `a12cd688-9975-44a6-a3ee-9c8c2dfe4974` deployed.
- [x] No DavDeploy resources, DNS, Pages, routes, Email Routing or custom domain were changed.
- [x] Owner-shared screenshots show Workers Free active and Workers Paid not subscribed (the paid option shows “Add”). The billable-usage screen showed “No data” at capture time before deployment; daily refresh means it does not prove zero post-deployment usage.
- [x] No plan, subscription, add-on or paid resource was enabled or changed. The project remains configured for free-tier services; shared free quotas can be exhausted, at which point requests may fail.
- [x] Cloudflare lists the configured model as Workers Free eligible; the production call succeeded. Shared account quotas remain a limit.
- [x] Synthetic-only, no clinical use, no real participants, and demo identity limitations are documented.
- [x] Public interactive Worker demo and static future vision work without the Mac.

## Reviewer assets

- [x] Existing 90.44-second, 1920×1080 original MP4 preserved unchanged on Worker and Pages.
- [x] New genuine 92.84-second, 1920×1080, 25 fps H.264 MP4 shows live inference, contributor withdrawal/filtering, same-request policy denial, the fictional benefit workflow and source repository.
- [x] New video contains readable explanatory on-screen captions; silence and lack of speech subtitles are stated accurately.
- [x] Latest fresh-session video shows benefit-based denial, the real session receipt and post-acceptance eligibility in 1920×1080; the single API submission was denied with `inferenceAttempted: false`, so no model call or free inference quota was used.
- [x] Independent Chromium verification checked the live application, GitHub repository, static vision page, new Pages MP4 playback (1920×1080, 92.40 seconds), existing Worker video URLs and existing Pages video fallbacks without authentication; all returned HTTP 200 with expected media types and no page errors.
- [x] Both local MP4s decoded; new asset probed. Worker and Pages copies returned unauthenticated HTTPS 200 with `video/mp4`; downloaded copies match expected size, dimensions, frame rate and duration.
- [x] Production landing page links to both recordings; Chromium verified both links and zero page errors.
- [x] Pages vision is live and static; the new 5.0 MB MP4 is independently playable there as a fallback.

## Fellowship evidence and boundaries

- [x] RFP alignment, project status, roadmap, reviewer guide, architecture, limitations and evidence URLs are documented.
- [x] Existing-solutions comparison accounts for overlap with Mozilla Data Collective, PySyft and Flower; no novelty or integration claim.
- [x] No SRHIN endorsement, real pilot, participant feedback, clinical validation or benefit delivery is claimed.
- [x] Mozilla personal application responses remain separate and are not generated or submitted.
- [ ] Optional physical Android device test; emulator installability passed.
- [ ] Optional owner YouTube upload; public MP4s currently satisfy the video evidence need.
- [ ] Real community co-design and any pilot require collaboration and ethics/safeguarding review; they are future work, not prototype acceptance evidence.
