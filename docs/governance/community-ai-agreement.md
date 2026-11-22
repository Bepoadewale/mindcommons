# Community AI Agreement: a shared set of rules for participating services

A Community AI Agreement is a small, machine-readable description of rules for a specific community and AI task. “Machine-readable” means software can read the fields and check them. MindCommons publishes an example format and a fixed software checker that other participating services can reuse.

The agreement is not a legal contract or proof that a community decision was legitimate. It cannot make an outside service follow the rules.

## What the agreement records

It can describe the active community policy, approved purposes, permitted research teams, each contributor's separate permission and expiry, allowed AI models and tasks, and limits on training, public results or clinical use.

The agreement has two versions:

- **Version 1** keeps its original meaning. Benefit commitments are recorded for information but do not block a research task.
- **Version 2** can name specific benefit commitments that must be agreed by the community and accepted by the research team before a task may run. The benefit may be delivered later. Missing or conflicting required benefit facts cause a denial.

The demo's ordinary policy has no required benefit condition. A fictional proposal adds a commitment to share results accessibly. This lets a reviewer see the same request denied before agreement and accepted after the fictional team takes responsibility.

## What the checker does

The fixed checker confirms that the agreement is supported and active, dates are valid, the requester and research purpose are allowed, the requested model and task are permitted, and each contribution has a current permission for that purpose. It also checks restrictions and any required benefit terms. It reports which records are allowed or excluded and why.

MindCommons checks the rules before a model call and checks again before it releases the result. A separate small Worker example uses the same checker in local tests.

## Important limits

The checker does not verify anyone's real identity, prove that consent was freely given, judge whether a community decision was fair, or inspect what the model does internally. It cannot control services that ignore the agreement, copies of data or model weights outside a participating service, or results that have already been shared. It cannot undo text already sent to a model provider.

The format is an experiment, not a complete standard. A change that alters meaning needs a new version and clear instructions for updating existing agreements. See the [package guide](../../packages/community-ai-agreement/README.md).
