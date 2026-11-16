# Technical validation notes

Reviewed 2026-11-16. These facts are a point-in-time check; confirm limits, model availability and APIs again before deployment.

## Platform direction

- Cloudflare Pages Functions execute server-side code on the Workers runtime, suitable for a small full-stack application without a persistent VM. Official overview: <https://developers.cloudflare.com/pages/functions/>.
- Pages Functions accept D1 and Workers AI bindings. Workers AI is called through a server-side binding; local Wrangler development can bind `AI`, but local inference calls still use the account and count against its allowance. Sources: <https://developers.cloudflare.com/pages/functions/bindings/> and <https://developers.cloudflare.com/pages/functions/wrangler-configuration/>.
- Wrangler is installable as a project dependency and supports local development, migrations and deployment: <https://developers.cloudflare.com/workers/wrangler/install-and-update/>. Pin the selected version in `package-lock.json`; do not assume a global CLI.
- Pages Functions are billed as Workers. The Workers Free plan currently includes 100,000 requests/day and 10 ms CPU time per invocation; static asset requests are free. A function exceeding free quotas can fail. Sources: <https://developers.cloudflare.com/pages/functions/pricing/> and <https://developers.cloudflare.com/workers/platform/limits/>.
- Cloudflare Pages Git integration can deploy from a GitHub branch and create preview deployments and PR check runs, but connecting it requires authorizing the Cloudflare GitHub application. This remains a pending authorization/account-access dependency, not a configured capability. Sources: <https://developers.cloudflare.com/pages/configuration/git-integration/> and <https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/>.
- Cloudflare supports monorepo Pages projects with a configurable root/build directory; build watch paths can avoid rebuilding for unrelated documentation changes. Sources: <https://developers.cloudflare.com/pages/configuration/monorepos/> and <https://developers.cloudflare.com/pages/configuration/build-watch-paths/>.
- D1 Free currently includes 5 million rows read/day, 100,000 rows written/day and 5 GB total storage across databases. D1 is scale-to-zero, with no compute charge. Free limits are enforced; excess queries fail until reset. Source: <https://developers.cloudflare.com/d1/platform/pricing/> and update: <https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/>.
- Workers AI currently includes 10,000 Neurons/day on Free; exceeding the allowance fails without upgrading. Some models require Workers Paid. Verify the selected model and cost before use. Source: <https://developers.cloudflare.com/workers-ai/platform/pricing/>; current catalog: <https://developers.cloudflare.com/workers-ai/models/>.
- Workers Free has a 10 ms CPU budget and 128 MB memory per invocation. This excludes conventional training or heavy Python frameworks from the hosted path. Source: <https://developers.cloudflare.com/workers/platform/limits/>.
- Cloudflare docs describe Workers with Static Assets as a current option. Pages Functions are retained for this first slice because the product path and docs directly support Vite-style static assets plus Functions and bindings. Revisit only if a concrete limitation appears. See <https://developers.cloudflare.com/workers/static-assets/>.
- React's official TypeScript guidance recommends the standard React type packages for JSX and browser use. Source: <https://react.dev/learn/typescript/>.
- Chrome's installability guidance requires HTTPS and a web app manifest with a name, 192 px and 512 px icons, `start_url`, and a supported display mode. Android/browser behavior can vary, so validate installability on an Android device after deployment. Source: <https://web.dev/articles/install-criteria/>.

## Frontend and testing direction

- React, TypeScript and Vite are selected for a strict typed SPA; exact package versions will be pinned in the lockfile at implementation.
- Use a semantic HTML/CSS design system and installable PWA manifest/service worker. Cache static public assets only; never cache API responses or private narratives.
- Unit and integration tests use a mock AI binding; Wrangler local D1 tests exercise the real SQLite-compatible database path. Playwright tests cover browser journeys. A separate live call is required to claim production inference.
- Workflow permissions should default to read-only and pin third-party actions to reviewed versions or immutable revisions. GitHub Actions docs: <https://docs.github.com/actions/security-for-github-actions/security-guides/automatic-token-authentication>.

## Research and legal context

- The Nigeria Data Protection Act 2023 treats health information as sensitive personal data and sets conditions on its processing, including consent for a specific purpose and the right to withdraw in relevant cases. This prototype will not process such data. Official Act: <https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf>. This note is not legal advice.
- The National Health Research Ethics Committee (NHREC) is Nigeria's national health research ethics body: <https://nhrec.gov.ng/>. A future study needs locally appropriate ethics review, safeguarding, and legal advice before recruitment or data collection.

## Environment and access evidence

- Apple M4/arm64, macOS 26.6.2, 16 GiB RAM; 34 GiB free disk at inspection.
- Git 2.50.1, GitHub CLI 2.101.0 (authenticated as `Bepoadewale`), Node 24.21.0, npm 11.19.0, Python 3.14.0, Docker 29.0.1, Cloudflared 2026.9.3.
- GitHub public repository created. Cloudflare's general token returns HTTP 401 `Invalid API Token`; the provisioner token verifies active but lists no accounts. No account identity or permissions confirmed; no cloud changes made.
