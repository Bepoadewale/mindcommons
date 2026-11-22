# Technical validation

This page summarizes the technical choices and checks that matter to reviewers. For a plain-language explanation, start with the [README](../../README.md) and [technical evidence summary](../fellowship/technical-evidence-summary.md).

## How the hosted demo is built

The public demo uses a React and TypeScript website, a Cloudflare Worker for server checks, D1 for temporary fictional records, and Workers AI for one fixed, bounded task. Only selected synthetic text is sent to the model. A fixed software checker decides whether the request is allowed; the model does not make permission decisions.

Cloudflare recommends Workers with Static Assets for new full-stack projects. Static website files and the API can share one address while API requests run through the Worker. The demo uses this setup.

- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [D1 database](https://developers.cloudflare.com/d1/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Wrangler local development](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## What has been checked

- A live request using synthetic text completed through the deployed AI model and returned visible text.
- A prohibited request was denied before the model was called.
- Withdrawing one fictional contributor's permission changed which sample records could be included.
- A different fictional community rule changed the outcome for the same request.
- A required fictional benefit condition blocked a request until the community agreement and research-team acceptance were recorded.
- Local automated tests check that a result is withheld if relevant rules change while the model is working. This race was tested with a mock model, not during a live model call.
- Browser tests cover the main reviewer journey and mobile layout. Android install and standalone launch were checked in an Android emulator; a physical phone has not been tested.

See the [project status](../fellowship/project-status.md) for public evidence links and limits.

## Cost and service limits

The demo uses Cloudflare's free service allowances and has no paid fallback. These allowances are shared across the account and may run out; if so, requests may fail. No paid plan or feature was enabled for this project. Provider limits and terms can change, so check the linked official pages before future deployment or increased use.

Provider limits and model availability can change. Check the official [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing and limits](https://developers.cloudflare.com/d1/platform/pricing/) and [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) pages before future deployments or increased use.

## Privacy and research safeguards

The demo uses fictional records only. The AI provider is an outside service; withholding a result cannot undo text already sent to it. The project does not claim patient-data readiness, clinical validation or legal compliance.

Nigeria's [Data Protection Act 2023](https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf) treats health information as sensitive personal data. Any future work with people would need appropriate ethics review, safeguarding, legal and privacy advice, and host and community authorization. The [National Health Research Ethics Committee](https://nhrec.gov.ng/) provides national research-ethics guidance. These references are background, not legal advice.

## Progressive web app checks

The app can be installed from a supported mobile browser. Testing confirmed that the public site, app manifest and icons loaded, and an Android 16 emulator could install and launch it. Offline behavior is limited to the cached public website shell; API actions still need the network. No private records are cached.

See Google's [installability guidance](https://web.dev/articles/install-criteria/) for browser requirements.
