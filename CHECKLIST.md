# Acceptance checklist

Legend: `[x]` verified; `[~]` started; `[ ]` not done.

## Repository

- [x] Public repository exists: https://github.com/Bepoadewale/mindcommons
- [x] Apache-2.0 license, Issues enabled, `main` protected for PRs, zero-approval solo-maintainer review policy.
- [x] PRs #1–#8 merged after required checks passed; GitHub verified the merges and source-branch cleanup.
- [x] Application, tests, contribution/security guidance and reproducible commands implemented; clean `npm ci` completed with 0 reported vulnerabilities.
- [x] Merged PR #1–#8 source branches removed locally/remotely.

## Phase 0

- [x] Mac, toolchain, GitHub identity and Keychain credential availability checked.
- [x] Official Mozilla RFP and SRHIN host challenge reviewed.
- [x] Official Cloudflare Pages Functions, D1 pricing, Workers limits and AI pricing reviewed.
- [x] DavDeploy read-only review and reusable lessons documented; existing repositories unchanged.
- [x] Research existing solutions, Nigeria data protection and research ethics context documented.

## Product and security

- [x] Synthetic community and visitor-isolated demo session.
- [x] Policy proposals and explicit server-side representative role check for activation.
- [x] Separate individual permissions, expiry, withdrawal, and version history.
- [x] Server-side fail-closed authorization and reason evidence.
- [ ] Allowed fixed job executes live Workers AI; denied request never invokes AI.
- [~] Local mock execution and denied-before-inference verified; live Workers AI call remains unverified pending Cloudflare access.
- [x] Model/job/policy provenance, audit history and honest integrity limits.
- [x] Demonstration benefit commitment and synthetic evidence, visibly hypothetical.
- [~] Responsive UI, PWA manifest/icons, bounded offline behavior and axe WCAG 2.1 A/AA passed; Android installation/device check pending.
- [x] Positive/negative governance, consent, API integration and browser paths verified locally.
- [x] Threat model, limits, fixed input validation, quotas and rate controls documented/implemented.

## Hosting and reviewer evidence

- [ ] Dedicated Cloudflare Pages and D1 resources; Workers AI binding; free-tier verified.
- [ ] Public HTTPS production URL works independently of Mac.
- [ ] Public video records verified production behavior.
- [x] Eight-screen future-product vision is publicly available at https://bepoadewale.github.io/mindcommons/; live HTTPS, all disclosures, assets, 390 px mobile width, no API calls, and axe WCAG 2.1 A/AA verified in Chromium. It is static and is not the live backend demo.
- [x] Reviewer guide, RFP mapping and 12-month roadmap documented and checked into the repository.
- [~] Source and static vision links verified; live backend demo and technical video remain unavailable pending Cloudflare authorization and recording.
