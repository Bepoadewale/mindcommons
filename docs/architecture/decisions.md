# Architecture decisions

## ADR-001: Pages Functions, D1 and Workers AI for the hosted demo

**Status:** selected, subject to account-access and free-plan verification.

**Decision:** use Cloudflare Pages static assets and TypeScript Functions, one D1 database, and a Workers AI binding. This puts the UI and narrow API on one origin, avoids an always-on server, and uses documented free allowances suitable for a small demonstration.

**Trade-offs:** Pages Functions share Workers' 10 ms free CPU budget and daily request allowance. D1 reads/writes and Workers AI neurons are bounded and fail when the free allowance is exceeded. Cloudflare remains a provider dependency. Hosting cannot proceed without verified account permissions.

**Alternatives:** a plain static site cannot enforce policy; a paid VM, managed database, or paid Workers plan violates the zero-cost constraint; conventional training is too resource-heavy. Workers with Static Assets is technically viable but adds no current benefit over the documented Pages functions directory and bindings.

## ADR-002: Deterministic authorization before inference

**Status:** accepted.

The model never decides whether a job is allowed. A server-side TypeScript function checks researcher role, active community policy, individual permission, purpose, approved fixed job, approval state, expiry and restrictions. Unknown facts deny. AI calls occur only after the checks pass.

## ADR-003: Synthetic anonymous reviewer sessions

**Status:** accepted for demo, not a real identity system.

Public visitors receive isolated short-lived sessions containing fictional roles and facts. The server, not a submitted role string, chooses the scenario capabilities. This lets reviewers explore without registration while keeping the demo's scope explicit. It does not secure a real governance body or validate real authority.

## ADR-004: Mock inference locally; live inference is separate evidence

**Status:** accepted.

Automated tests use a deterministic mock. Wrangler local D1 exercises migrations and API persistence. A live Workers AI request will be bounded and only made after confirming free availability. Mock tests do not count as live inference evidence.

## ADR-005: No real participant or health data

**Status:** accepted.

All content is fictional and synthetic. The prototype will not accept arbitrary narrative uploads or clinical prompts. Any future human-subject work requires co-design, ethical review, privacy/security assessment, safeguarding, and legal advice.
