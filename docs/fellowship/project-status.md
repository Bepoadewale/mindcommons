# Project status

**Updated: November 22, 2026.** MindCommons is an independent, public technical prototype. It is not an established cooperative, an SRHIN project, a community-approved product, a clinical tool, or an awarded Mozilla project. The demo uses fictional people and synthetic research material only.

## What a reviewer can try

- Open the [live demo](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/).
- Read the [step-by-step demo guide](../demo/reviewer-guide.md).
- Explore the [future-product design](https://bepoadewale.github.io/mindcommons/). It is a visual guide only, not a working service.
- Watch the [1080p policy and benefit walkthrough](https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4). It shows a real server denial and decision receipt without calling AI.
- Watch the [captioned video of a separate synthetic AI run](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4).

## What has been demonstrated

- A live, bounded AI run processed fictional text after the server approved the request.
- With a permissive fictional rule, withdrawing contributor B's permission left only contributors A and C's records eligible.
- A different fictional rule changed the outcome for the same request. The server denied it before AI because the rule required active permission from everyone.
- A required fictional benefit condition blocks the request until the community agrees to it and the research team accepts it.
- A second check can withhold a result if relevant permission, policy, or benefit information changes while the model is working. This was tested locally with a controlled test model; it was not induced during a live model call.
- A session-only decision receipt explains the decision without including raw research text, session cookies, or model output. Another session cannot read it.
- The same portable agreement checker is used by the app and tested in a separate small Worker example.

The live service uses Cloudflare Workers, D1 (a small database), and Workers AI. Test runs mostly use a clearly labelled mock, meaning a substitute model used to test the software without making an AI call. See [technical validation](../research/technical-validation.md) for detailed evidence.

## What remains unproven

No community demand, participant feedback, SRHIN endorsement, partnership, real benefit delivery, clinical validation, or real-world pilot is claimed. The demo's role switcher does not verify identity or representative authority. The agreement only affects services that choose to use it; it cannot control outside copies of data or models or recall results already shared.

The demo has no paid fallback. Its free service allowances are shared across the Cloudflare account and may run out; if that happens, requests may fail. No paid service was enabled for this project.

The latest video is silent and uses on-screen captions, not narration or closed captions. Android installation was checked in an emulator; a physical phone has not been tested.

## Fellowship path

The proposed [SRHIN roadmap](srhin-embedded-roadmap.md) describes work that could happen only if the fellowship is awarded, a host relationship is established, and the necessary safeguards are approved. Community authority, consent, benefit terms, and any pilot must be shaped with the people affected.
