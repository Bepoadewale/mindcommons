# Acceptance checklist

Legend: `[x]` verified; `[~]` in progress; `[ ]` not done or optional future work.

## Fellowship-strengthening follow-up

- [x] PR #37 merged: benefit obligations are optional, explicit authorization prerequisites in Agreement v2; Agreement v1 meaning is retained. The initial policy remains permissive. Local API integration denies before inference until community agreement and research-team acceptance; the same request can proceed after acceptance.
- [x] PR #37 merged: conditional result release checks that required benefit facts remain unchanged during model execution; the delayed-inference API integration verified withholding. PR checks and post-merge CI passed. Hosted behavior for this new code remains unverified because no production migration or deploy was performed.
- [x] PR #38 merged: consent explanation, governance design framework, data-flow audit and cross-session API tests. Required checks and post-merge CI/Pages publication passed.
- [~] Portable Agreement v2 conformance and session-scoped decision receipt are implemented on `feat/decision-receipts-conformance`; local verification and browser suites passed. PR and GitHub checks are pending; hosted release does not include these changes yet.
- [ ] Guided reviewer journey, final RFP/status/evidence reconciliation, revised demo script, and production reconciliation remain.

## Repository and quality

- [x] Public Apache-2.0 repository and protected PR-only `main`; four required checks; no solo-approval blocker.
- [x] PRs #1–#35 merged after their required checks passed; merged source branches cleaned up locally and remotely. PR #35 post-merge CI run `44137169473` and Pages run `44137169692` passed.
- [x] PR #34 checks passed in run `44134264751`; post-merge CI run `44134751119` and Pages publish run `44134751142` succeeded.
- [x] Previous main `npm run verify` passed with 38 unit tests and Worker/D1 integration; current branch `npm run verify` passed with 55 unit tests and local integration.
- [x] Current branch `npm run test:e2e` passed 7/7; `npm run test:e2e:fullstack` and `npm run test:agreement` passed with explicitly labeled mock AI; `npm run test:vision-static` passed 3/3 as part of verify.

## Governance and technical contribution

- [x] Every synthetic contribution has a separate purpose-specific permission, expiry, status and version.
- [x] Live withdrawal of contributor B under policy v1 permitted only records A and C.
- [x] Approving v2 changed the outcome for the identical request and blocked it server-side before inference.
- [x] Output authorization is rechecked; local integration cases verify concurrent withdrawal/policy changes withhold the result and record the event.
- [x] Portable Community AI Agreement JSON Schema and deterministic evaluator are used by MindCommons and a separately testable minimal Worker example.
- [x] Agreement boundaries are explicit: it cannot control systems that ignore it, uncontrolled copies, or already released outputs.
- [x] Real Workers AI inference and denied request were verified in production using synthetic content.
- [x] Benefit workflow completed in production synthetic session: community agreement, team acceptance, evidence marker and community review.

## Hosting and safety

- [x] Exact dedicated Worker and D1 were confirmed; migrations 0005 and 0006 applied; Worker `b01d3f96-d72a-41a2-b751-88dff3c7adc9` deployed.
- [x] No DavDeploy resources, DNS, Pages, routes, Email Routing or custom domain were changed.
- [x] No plan, subscription, add-on or paid resource was created or changed. Prior same-day preflight reported zero active subscriptions; this session's subscription-list API read returned 403, so current billing status could not be re-read through that endpoint.
- [x] Cloudflare lists the configured model as Workers Free eligible; the production call succeeded. Shared account quotas remain a limit.
- [x] Synthetic-only, no clinical use, no real participants, and demo identity limitations are documented.
- [x] Public interactive Worker demo and static future vision work without the Mac.

## Reviewer assets

- [x] Existing 90.44-second, 1920×1080 original MP4 preserved unchanged on Worker and Pages.
- [x] New genuine 92.84-second, 1920×1080, 25 fps H.264 MP4 shows live inference, contributor withdrawal/filtering, same-request policy denial, the fictional benefit workflow and source repository.
- [x] New video contains readable explanatory on-screen captions; silence and lack of speech subtitles are stated accurately.
- [x] Both local MP4s decoded; new asset probed. Worker and Pages copies returned unauthenticated HTTPS 200 with `video/mp4`; downloaded copies match expected size, dimensions, frame rate and duration.
- [x] Production landing page links to both recordings; Chromium verified both links and zero page errors.
- [x] Pages vision is live and static; the new video is mirrored there as a fallback.

## Fellowship evidence and boundaries

- [x] RFP alignment, project status, roadmap, reviewer guide, architecture, limitations and evidence URLs are documented.
- [x] Existing-solutions comparison accounts for overlap with Mozilla Data Collective, PySyft and Flower; no novelty or integration claim.
- [x] No SRHIN endorsement, real pilot, participant feedback, clinical validation or benefit delivery is claimed.
- [x] Mozilla personal application responses remain separate and are not generated or submitted.
- [ ] Optional physical Android device test; emulator installability passed.
- [ ] Optional owner YouTube upload; public MP4s currently satisfy the video evidence need.
- [ ] Real community co-design and any pilot require collaboration and ethics/safeguarding review; they are future work, not prototype acceptance evidence.
