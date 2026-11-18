# Technical evidence summary

**Project status:** Independent technical prototype. MindCommons is not an established cooperative, SRHIN project, community-validated product, clinical application, or real pilot. The hosted demonstration and all fixtures use synthetic data. This document summarizes engineering evidence; it is not a personal fellowship application response.

## Problem and SRHIN challenge

SRHIN's challenge describes mental-health data from African communities being used in AI without sufficient consent, community control or equitable benefit-sharing. MindCommons explores whether community-defined rules, separate individual permissions, model-use restrictions and agreed benefit conditions can be enforced by AI services that choose to participate in a shared technical agreement. The prototype leaves legitimate authority and acceptable governance arrangements open for future co-design.

## Why this technical approach may matter to the SRHIN challenge

The technical question is whether community and individual decisions can change an AI service's behavior when a research request arrives—not only be documented as consent text. MindCommons tests that question with a participating-service boundary: the request is checked against a collective policy, each contributor's own permission, the allowed model operation, and any required benefit terms. The service refuses a request before inference when an applicable condition is missing and creates a session-scoped receipt that records the reasons. This links consent, privacy, community control, and benefit accountability in one inspectable workflow. It does not prove that a community wants this design, establish who has authority, or control services that ignore the agreement. The synthetic demo is intended as a concrete object for future co-design, not a substitute for it.

## Implemented technical capabilities

- Synthetic, session-isolated community, policy, individual-permission, research and benefit records.
- Deterministic server-side authorization for a fixed synthetic inference job. Requests denied by policy, permission or required benefit conditions do not invoke the inference binding.
- Community AI Agreement versions 1.0.0 and 2.0.0. Version 2 can make named benefit obligations prerequisites without changing version 1 semantics.
- A conditional D1 result-release guard that withholds a result when the applicable policy, permissions, researcher session or required benefit facts change during inference.
- A portable reference evaluator and a separately testable Worker consumer. Agreement conformance tests cover withdrawal, policy changes, benefit states, malformed/future agreements, denial-before-inference and output withholding.
- A session-scoped JSON decision receipt that records authorization and execution evidence without exporting model output or raw narratives. Production checks verified a denial receipt and confirmed a separate session cannot retrieve it.
- A guided reviewer walkthrough with a deterministic preview computed from the current agreement snapshot. It displays eligible/excluded contributions and authorization reasons without invoking AI; the server repeats authorization when a visitor explicitly submits the fixed job. The current Worker serves this experience.
- Fictional benefit workflow states: community agreement, research-team acceptance, evidence submission and community review. Recording these states does not establish delivery or payment.

## Demonstrable enforcement and architecture

The current public application and captioned recording show a genuine bounded Workers AI call on synthetic inputs, contributor-specific filtering after withdrawal, and server-side denial after a different collective policy is activated. The local branch adds an opt-in benefit prerequisite: the request is denied before inference while required terms are missing, then becomes eligible after community agreement and research-team acceptance, assuming other conditions pass. Local integration tests use a labelled deterministic mock; they are not production inference evidence.

The browser sends a fixed job request to a Cloudflare Worker. The Worker reads session-scoped D1 facts, evaluates policy, permissions and required benefit conditions, selects eligible synthetic records, and sends only those records to Workers AI. Before storing or returning model output, a conditional database update checks that authorization facts remain unchanged. Cloudflare Workers AI is an external processing boundary. A post-inference withdrawal can withhold release, but cannot recall information already transmitted to the provider or reverse provider processing.

## Open-source and reproducibility evidence

- Public Apache-2.0 repository: <https://github.com/Bepoadewale/mindcommons>
- Local commands: `npm ci`, `npm run verify`, `npm run test:e2e`, `npm run test:e2e:fullstack`, and `npm run test:agreement`.
- PR #39 local verification: 55 unit tests passed; Worker/D1 local integration passed with mock inference; seven browser tests passed; full-stack local browser acceptance passed; typecheck, lint, builds, format and documentation validation passed. PR #40 adds eight browser tests and full verification; all required PR checks passed in run `44191296886`. Its post-merge CI run `44192355625` and static Pages publication run `44192355348` passed.
- Existing hosted demonstration: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>.
- Existing static future-vision wireframe: <https://bepoadewale.github.io/mindcommons/>. It is a static concept page without the backend or AI.
- Captioned 1080p screen recording: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4> and independent Pages copy at <https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4>.
- Latest 92.40-second 1080p policy-and-benefit walkthrough: <https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4>. It records real production denial and receipt behavior, but deliberately does not invoke AI. The prior recording above remains the separate live-inference evidence.

PRs #37–#46 have passed the PR workflow and merged to `main`. PR #46 added the latest video and published it to GitHub Pages; independent Chromium verification confirmed playback. The Worker and D1 were updated earlier to the release containing the required-benefit gate, decision receipt and policy preview. Owner-shared screenshots show Workers Free active and Workers Paid not subscribed. The billable-usage screen showed “No data” before deployment and refreshes daily; it is not proof of zero post-deployment usage. No paid service was enabled. The live denial and receipt isolation were verified; one bounded synthetic Workers AI request completed. The new video records the latest interface and benefit gate without inference; the previous video remains the separate live-inference evidence. Before any future deployment, recheck free-tier status and usage; if a feature requires payment, leave it disabled.

## Limitations and unresolved decisions

- Demo roles are switchable seats, not authenticated people; the software cannot establish that a representative has legitimate authority.
- The agreement binds only participating services that implement it. It cannot control copied datasets, unrestricted external model use, model weights or services that ignore it.
- The system uses no real health information and is not suitable for patient data, clinical decisions or research recruitment.
- Receipts and audit rows are ordinary database records. They are not cryptographically signed, tamper-proof, independently certified or legally conclusive.
- Authentication for real researchers and representatives, identity and authority verification, appeals, safeguarding, privacy/legal review, data retention decisions, provider terms and any ethics approval remain future work.
- The governance framework and benefit terms are configurable examples, not decisions made by a community.

## Proposed fellowship research and development

The proposed June 2027–May 2028 Embedded Fellowship pathway is documented in [the SRHIN roadmap](srhin-embedded-roadmap.md) and [decisions reserved for co-design](community-decisions-after-selection.md). Subject to an authorized host relationship and appropriate safeguards, it would begin with community discovery and co-design, adapt the agreement based on participants' direction, consider a tightly bounded pilot only if approved, and evaluate comprehension, agency, withdrawal, governance and benefit accountability. A no-pilot outcome remains valid. No outreach, participant work or host endorsement is claimed.

## Links and status

See the [reviewer guide](../demo/reviewer-guide.md), [RFP alignment](rfp-alignment.md), [project status](project-status.md), [security threat model](../security/threat-model.md), and [verified evidence links](evidence-links.md). The owner may upload the existing video to YouTube separately; no upload is claimed. The fellowship application remains the applicant's own work and voice.
