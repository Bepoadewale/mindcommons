# Technical evidence summary

This page explains the prototype for reviewers. It is not a personal fellowship application response.

## The problem

People may contribute information that helps researchers build or test AI systems, while having little say over later uses or benefits. The Mozilla Foundation's 2027–2028 fellowship call describes this concern in its SRHIN host challenge for mental-health data from African communities.

MindCommons explores a technical response: let communities and individuals set separate rules, then make participating AI services check those rules before they use a contribution.

## A short example

A fictional community permits a research team to study synthetic wellbeing examples, but not to use them for advertising. Each fictional contributor also decides whether their own example may be used.

If contributor B withdraws permission, B's example is left out. If the community changes its rule to require permission from everyone, the same research request is denied. If a required benefit, such as sharing an accessible summary, has not been accepted by the research team, the job is also denied. The server applies these checks before it calls the model.

The demo can show a real, limited model operation on synthetic text. Its policy preview does not call a model. Test runs use a clearly labelled substitute model and are not proof of live AI use.

## What is implemented

- A public, responsive demonstration with fictional community and researcher roles.
- Separate, versioned permissions for each synthetic contribution.
- A community policy that can change the outcome for the same request.
- A portable, versioned Community AI Agreement and a fixed software checker.
- A required benefit condition that can block or allow an operation after agreement and team acceptance.
- A second authorization check before the service releases a model result.
- A session-only JSON receipt that records the decision and reasons without exporting raw narratives or model output.
- A second small Worker example and tests that use the same agreement checker.
- Automated software and browser tests. CI (the repository's automated checks) runs on pull requests and after changes to the main branch.

## How it is built

The website runs in a browser. A Cloudflare Worker checks each request on the server. D1 stores short-lived demo records. Workers AI runs the approved fixed task. Only selected synthetic text is sent to the model provider.

The policy checker uses fixed software rules, not an AI model. The demo's role switcher does not verify real identities or establish that a representative is legitimate.

## Limits

The app cannot make an outside service follow the agreement. It cannot control copied data or model weights, recall output already shared, or reverse processing already done by the model provider. A recorded demo decision is not a tamper-proof or legally certified record.

No real people, patient records, clinical decisions, participant feedback, community approval, SRHIN endorsement, or pilot are involved. The prototype is not ready for human-subject research. Future work needs appropriate host authorization, community co-design, legal and ethics review, safeguarding, privacy and security assessment.

## What should happen next

If the fellowship and a host relationship proceed, the next work should begin by asking affected people what authority, permission, privacy, and benefits should mean in their setting. They may change or reject the current design. The [proposed roadmap](srhin-embedded-roadmap.md) describes that process. The [evidence links](evidence-links.md) point to the public software and recordings.
