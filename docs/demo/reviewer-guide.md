# A simple guide to the MindCommons demo

**Open the [live demo](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/).** It uses a made-up community and synthetic research text. No real people or health records are involved.

MindCommons explores this question: what if people could set ongoing rules for how their contributions are used in AI research? The demo shows software checking a community rule and each person's own permission before a research job runs.

## Follow the example

1. Choose **Try the synthetic scenario**. Everything in the scenario is fictional.
2. Read the proposed research request. It asks to examine made-up material for community wellbeing research.
3. Look at the community's rule and each contributor's separate permission.
4. Switch to the fictional contributor seat and withdraw contributor B's sample permission.
5. Return to the researcher seat and preview the request. The preview explains which records are eligible. It does not call AI.
6. Run the approved fixed task if you want to see a real, bounded AI operation on synthetic text. The model is a tool that processes the text; it does not decide whether the request is allowed.
7. Switch to the fictional representative seat and approve the proposal that requires permission from every contributor. Preview the same request again. The server now denies it because B withdrew permission. The request never reaches the model.
8. Try the commercial advertising request. The server denies this use too.
9. Open the decision receipt to see the rule versions, included and excluded sample records, reasons, and whether AI ran. Receipts belong to one demo session; another session cannot read them.
10. Reset the scenario before exploring benefits so the earlier withdrawal and policy change do not affect this example. Then review the fictional benefit commitment. The community must agree to it and the fictional research team must accept it before the rule allows the request. Evidence and community review are separate steps. This does not mean a real benefit was delivered.

A policy preview is an explanation based on the current demo records. The server checks the rules again when a job is submitted, so the preview itself does not grant permission.

## Videos and future design

- [Policy and benefit walkthrough](https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4): 1080p, on-screen captions, no AI call. It shows a real server denial and session receipt.
- [Captioned recording](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4): shows a separate real, bounded AI run on synthetic material.
- [Original screen recording](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4).
- [Future-product design](https://bepoadewale.github.io/mindcommons/): a static visual guide. It has no live API or AI behavior.

## What this demo does not prove

The role switcher is a shortcut for exploring the example. It does not check anyone's real identity or prove that a person has the right to represent a community. The demo is not community-approved, user-tested, clinically validated, or ready for patient data. A result withheld after a rule changes cannot undo text already sent to the outside model provider. The agreement cannot control services that do not use it or copies that leave those services.

The [project status](../fellowship/project-status.md) and [privacy limits](../security/privacy-limitations.md) explain what has been tested and what remains future work.
