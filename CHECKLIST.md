# Acceptance checklist

Legend: `[x]` verified; `[~]` in progress; `[ ]` not done.

## Repository and local quality

- [x] Public Apache-2.0 repository and protected PR-only `main` exist; four required checks are configured without a solo approval blocker.
- [x] PRs #1–#33 merged after required checks; merged branches cleaned up.
- [x] Main CI run `44128935139` passed `validate`, `verify`, `browser-acceptance`, and `secret-scan` after PR #33.
- [x] Previous local checks covered 38 unit tests, six reviewer browser tests, three vision tests, local D1 integration, accessibility, and output-release concurrency behavior.
- [~] Run the full local verification again after the video, link, and documentation changes.

## Governance and technical contribution

- [x] Every synthetic contribution has its own purpose-specific permission, expiry, status, and version.
- [x] Live withdrawal of contributor B under policy v1 permits only A and C's records.
- [x] A distinct approved v2 policy changes the authorization outcome for the identical request and blocks it server-side before inference.
- [x] Output authorization is rechecked; locally tested concurrent withdrawal/policy change leaves output withheld and records the event.
- [x] Portable Community AI Agreement JSON Schema and deterministic evaluator are used by MindCommons and a separately testable minimal Worker example.
- [x] Agreement documentation says compliant participating services can check it; it cannot control services that ignore it or copies of data/model weights.
- [x] Real Cloudflare Workers AI inference and prohibited request behavior were verified in production with synthetic content.
- [x] Benefit workflow completed in production synthetic session: community agreement, team acceptance, evidence marker, community review.

## Hosting and safety

- [x] Exact dedicated Worker and D1 resources were confirmed; D1 migrations 0005 and 0006 applied; Worker `a4471379-e78c-46b9-9313-0f8c8250038e` deployed.
- [x] Existing DavDeploy resources, DNS, Pages, routes and Email Routing were not changed.
- [x] No paid plan or paid resource was created or changed. A prior same-day preflight reported zero active paid subscriptions; current subscription-list API read failed with 403, so this session could not independently re-read billing state.
- [x] Cloudflare lists the configured model as Workers Free eligible; the live model call succeeded. Shared account quotas remain a limit.
- [x] Synthetic-only, no clinical use, no real participants, and demo identity limitations are stated.
- [x] Public interactive Worker demo and static future vision remain available without the Mac.

## Reviewer assets

- [x] Existing 90.44-second, 1920×1080 original MP4 preserved unchanged on Worker and Pages.
- [x] New genuine 92.84-second, 1920×1080 recording captured after the production deployment; it shows live AI, contributor withdrawal, same-request policy denial, benefits, and the public source repo.
- [x] New video has readable explanatory text burned in; its silence and lack of spoken-word subtitles are documented accurately.
- [x] New asset passes H.264 MP4 probe at 1920×1080 and 25 fps; recorder assertions passed with no browser errors.
- [~] PR to publish new captioned MP4 on Worker and GitHub Pages, make it the landing-page primary video link, and keep original recording linked.
- [ ] After merge, verify new Worker and Pages video URLs return unauthenticated HTTPS 200, `video/mp4`, and correct media metadata; verify landing-page link.

## Fellowship evidence

- [x] RFP alignment, project status, roadmap, reviewer guide, architecture and limitations documented.
- [x] Existing-solutions comparison updated to account for MDC licensing/access/compensation overlap; no novelty claim or integration claim.
- [x] No SRHIN endorsement, real pilot, participant feedback, or benefit delivery is claimed.
- [x] Personal Mozilla application responses remain separate and are not generated or submitted here.
- [~] After the video publication PR completes, update evidence links, final status, PR/workflow history and cleanup state.

## Remaining open validation

- [ ] Optional physical Android device test; emulator installability has passed.
- [ ] Owner's YouTube upload, if desired; until then the independent public MP4 links are the video evidence.
- [ ] Real community co-design, local ethics/safeguarding review and any pilot remain future work and are not prerequisites to claiming the current synthetic prototype evidence.
