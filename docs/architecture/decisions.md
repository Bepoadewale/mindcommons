# Architecture decisions

## ADR-001: Workers Static Assets, D1 and Workers AI for the hosted demo

**Status:** selected; deployment remains subject to confirming account billing state and the required write permissions.

**Decision:** use one Cloudflare Worker with Static Assets, one D1 database, and a Workers AI binding. The API runs in a typed Worker entry point on the same origin as the React assets. `run_worker_first` matches only `/api/*`, so matching static assets bypass Worker execution and retain Cloudflare's free, unlimited asset serving. The Worker applies deterministic authorization before it can call AI.

**Trade-offs:** Workers Static Assets is Cloudflare's current recommendation for new full-stack applications and gets current platform investment. The team owns a small explicit API router instead of relying on Pages' file-based route mapping. API invocations share the Workers Free daily request and CPU limits; D1 and Workers AI free allocations are bounded and fail closed when exhausted. Cloudflare remains a provider dependency. Deployment still requires account-level billing and write-scope verification.

**Alternatives:** Pages Functions also supports the current D1 and AI bindings, file-based API handlers, and branch previews, and would have avoided the explicit router. Cloudflare now recommends Workers Static Assets for new projects, supports `_headers` and `_redirects` there, and static asset requests remain free and unlimited; this makes Workers the better starting point before any production deployment. GitHub Pages remains a separate, verified static-only vision fallback. A plain static site cannot enforce policy; a paid VM, managed database, or paid Workers plan violates the zero-cost constraint; conventional model training is too resource-heavy.

The hosted model candidate is `@cf/google/gemma-4-26b-a4b-it`. Cloudflare's 2026-11-05 model-deprecation notice invalidated the first Llama candidate. It appears in the current account-accessible model catalog, but a live bounded call and free allocation remain unverified. Local Worker development sets explicit mock-only variables; automated and local application tests do not call an AI model.

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

## ADR-006: GitHub Pages hosts a vision-only fallback

**Status:** deployed and verified as a static fallback while Cloudflare account access is unavailable.

Publish a separately built, static future-product visualization at the repository's GitHub Pages URL. Client-side expandable details let visitors inspect proposed screen content, but do not write data or invoke a backend. This page bundle has no demo API, model calls, service-worker registration or install-manifest link; the live governance-controlled demo still requires the Worker, D1 and Workers AI deployment in ADR-001. GitHub Pages is available for public repositories on GitHub Free and supports custom GitHub Actions workflows. The fallback makes the proposed screens reviewable without implying that the backend is deployed.

The Pages URL is not evidence of a live prototype. It becomes a verified artifact only after the GitHub Pages configuration, deployment workflow and public HTTPS response are checked. Sources: [GitHub Pages availability and limits](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [custom workflow publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
