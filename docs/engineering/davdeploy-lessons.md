# Engineering lessons from DavDeploy

Read-only review of the public repositories `Bepoadewale/davdeploy` and `Bepoadewale/davdeploy-frontend`, 2026-11-16. This records practices, not an application-code dependency. Neither repository was modified.

## Practices to carry forward

- **Put authority on the server.** DavDeploy documents that UI guards improve usability but do not authorize tenants, roles, approvals, or execution. MindCommons must re-check community authority, collective policy, and individual permission in the API before any AI call.
- **Keep the workflow explicit.** Its plan review path freezes a submitted revision and records an attributable decision. MindCommons can use clear proposal states, immutable policy versions, and evidence linking each research execution to the policy version checked.
- **Keep domains and effects separate.** A decision does not silently trigger deployment. Here, approving a policy and executing a research job should be distinct operations with their own checks and audit events.
- **Use typed, narrow contracts.** The frontend consumes a documented API contract; policy and planning live in the backend. MindCommons should use shared schemas and a small set of fixed jobs, not arbitrary browser input that becomes executable work.
- **Be precise about demo versus live behavior.** DavDeploy distinguishes executed, simulated, and planned capabilities, and says where fixture pricing/inventory are used. MindCommons must similarly label synthetic identities, mocked local AI, live inference, and future pilot plans.
- **Make failures inspectable.** Useful error states, explicit roles, rejection reasons, audit timelines, and bounded readiness checks are better evidence than ambiguous buttons.
- **Automate quality gates.** Reusable CI patterns include lockfile installs, formatting/lint/types/tests/build, browser acceptance, secret scanning, least-privilege workflow permissions, and pull-request evidence.
- **Treat deployment cost and resource scope as design constraints.** The frontend repo documents Cloudflare Free guardrails. MindCommons must verify today's limits for the dynamic service and bound requests, writes, AI input, and usage.
- **Maintain a PR trail.** Both repositories use PR-only changes, focused changes, required validation, and source-branch cleanup. MindCommons adopts this with zero human approvals for a solo maintainer and CI as the automated merge gate.

## Deliberately not reused

MindCommons will not depend on DavDeploy code, APIs, databases, secrets, identity systems, customer infrastructure, commercial services, or production domains. Its stack and scenario are independently deployable public-interest infrastructure.

## Reviewed artifacts

- Backend: `AGENTS.md`, `README.md`, `.github/workflows/ci.yml`, `docs/architecture/PLAN_APPROVAL_ARCHITECTURE.md`, `docs/security/APPROVAL_RBAC.md`.
- Frontend: `AGENTS.md`, `README.md`, `.github/workflows/ci.yml`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/AUTH_AND_SECURITY.md`, `docs/CLOUDFLARE_FREE_COST_GUARDRAILS.md`.
