# Community AI Agreement protocol (prototype)

MindCommons publishes a small, portable JSON agreement format and a TypeScript reference evaluator. Its purpose is to give participating AI services a common, inspectable policy object and a deterministic way to decide whether a fixed operation may use specific contributions.

## What it carries

The v1 agreement includes a schema version, agreement identifier, community identifier, policy version and effective status; permitted purposes; authorized researcher principals; a permission purpose, version, status and expiry for each contribution; allowed model identifiers and job types; restrictions on model training, public outputs and clinical use; and benefit obligations with community agreement and research-team acceptance states.

The evaluator checks the agreement and request shape, duplicate contribution identifiers, active policy, researcher, purpose, model, job type, use restrictions, each requested contribution's matching permission, permission expiry, and the community's rule for a withdrawn contribution. Its result lists approved contribution IDs, excluded records, permission versions and decision reasons. It does not use a language model to decide authorization.

## Implementations in this repository

The MindCommons research endpoint adapts its active database policy and contributor permission records to the same agreement format and runs the reference evaluator before inference. Visitors can inspect the agreement and JSON Schema in the demo. A separate minimal Worker in `examples/portable-ai-worker/` uses the same evaluator, fixed synthetic records and an AI binding. Tests verify that both services deny a prohibited request before calling the model and that the example service withholds output when the agreement changes during inference.

## Limits and open questions

This prototype does not establish whether a decision was legitimate, represent a legal agreement, make external services obey the policy, or prevent use of copies of data or model weights outside a participating service. Its contributor identities and permissions are fictional. The research, meanings, authority, dispute process, and benefit terms require co-design with people affected before any real pilot. A future protocol should consider signed agreement versions, interoperable identity and revocation, cross-organization semantics, conflict resolution, and independent conformance tests; those are not implemented here.

The format is deliberately versioned and bounded rather than presented as a complete standard. Changes that alter semantics require a new schema version and migration guidance.
