# Acceptance checklist

Legend: `[x]` verified; `[~]` started; `[ ]` not done.

## Repository

- [x] Public repository exists: https://github.com/Bepoadewale/mindcommons
- [x] Apache-2.0 license, Issues enabled, `main` protected for PRs, zero-approval solo-maintainer review policy.
- [x] PRs #1–#17 merged after required checks passed; GitHub verified the merges and source-branch cleanup.
- [x] Application, tests, contribution/security guidance and reproducible commands implemented; clean `npm ci` completed with 0 reported vulnerabilities.
- [x] Merged PR #1–#16 source branches removed locally/remotely.

## Phase 0

- [x] Mac, toolchain, GitHub identity and Keychain credential availability checked.
- [x] Official Mozilla RFP and SRHIN host challenge reviewed.
- [x] Official Cloudflare Pages, Workers Static Assets, D1 pricing, Workers limits and AI pricing reviewed; the implementation now follows the current new-project recommendation.
- [x] DavDeploy read-only review and reusable lessons documented; existing repositories unchanged.
- [x] Research existing solutions, Nigeria data protection and research ethics context documented.

## Product and security

- [x] Synthetic community and visitor-isolated demo session.
- [x] Policy proposals and explicit server-side representative role check for activation.
- [x] Separate individual permissions, expiry, withdrawal, and version history.
- [x] Server-side fail-closed authorization and reason evidence.
- [~] Live fixed job invokes Workers AI and the prohibited request is rejected before inference; model output settings are being corrected because the first live response had an empty visible answer.
- [x] Local mock execution and denied-before-inference behavior verified; production inference is separately verified, not inferred from mock tests.
- [x] Model/job/policy provenance, audit history and honest integrity limits.
- [x] Demonstration benefit commitment and synthetic evidence, visibly hypothetical.
- [~] Responsive UI, PWA manifest/icons, bounded offline behavior and axe WCAG 2.1 A/AA passed; Android installation/device check pending.
- [x] Positive/negative governance, consent, API integration and browser paths verified locally.
- [x] Threat model, limits, fixed input validation, quotas and rate controls documented/implemented.

## Hosting and reviewer evidence

- [x] Workers Static Assets entrypoint and local Worker/D1 integration merged through PR #14; all required CI checks passed.
- [x] Dedicated D1 database `mindcommons-demo-d1` created and all three migrations applied; account has zero subscriptions and Workers Free is Cloudflare's default.
- [x] Dedicated Cloudflare Worker with Static Assets deployed to `workers.dev`; D1 and Workers AI bindings are configured.
- [x] Public HTTPS production URL serves the application and API independently of Mac.
- [~] A live synthetic AI call and denied request are verified; fix the empty visible model answer, deploy it, and re-record before publishing the final video.
- [~] A genuine 106.96-second Chromium screen recording exists locally; replace after the output fix and verify public Pages access.
- [x] Eight-screen future-product vision is publicly available at https://bepoadewale.github.io/mindcommons/; live HTTPS, all disclosures, assets, 390 px mobile width, no API calls, and axe WCAG 2.1 A/AA verified in Chromium. It is static and is not the live backend demo.
- [x] Reviewer guide, RFP mapping and 12-month roadmap documented and checked into the repository.
- [~] Source, live backend, and static vision links verified; public video and the final live AI result presentation remain in progress.
