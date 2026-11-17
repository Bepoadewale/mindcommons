# Portable agreement: minimal AI service example

This is a separate, minimal Cloudflare Worker that loads a fictional Community AI Agreement and checks it before calling a fixed Workers AI binding. It accepts both agreement v1 and v2; v2 may make named benefit commitments prerequisites. The agreement lists which fictional researcher principal is allowed. A service token authenticates the caller; the Worker takes the researcher identity from server-side configuration rather than trusting a body field. It accepts a structured request, never accepts user-supplied prompts or records, and includes only contributions selected by the evaluator.

The fixture is synthetic. The Worker is an independently testable reference example; it is not deployed and its test double does not prove a live model call. The local conformance tests need no Cloudflare account, API token, D1 database or model allowance. `wrangler.jsonc` documents the binding needed if a maintainer later runs it with an authorized Workers AI account. Keep it on a free plan and check the current model's allowance before any live request.

From the repository root:

```sh
npm install
npm run test:agreement
npx wrangler dev --config examples/portable-ai-worker/wrangler.jsonc
```

The conformance suite compares the same agreement and request in the MindCommons reference authorization path and this Worker consumer. It covers v1 compatibility, contributor withdrawal, a collective require-all policy, v2 benefit prerequisites, missing obligations, future-effective agreements, unsupported versions, pre-inference denial and output withholding after benefit state changes. To use the protocol in another service, authenticate the caller independently, load a fresh effective agreement and current permission/benefit facts, validate the structured request, call the evaluator before inference, send only authorized records, then re-read the agreement and withhold output if relevant state changed.

The sample Worker uses a static fixture for reproducibility. A real integrating service must define how agreement updates and individual revocations reach it, how quickly stale copies expire, and how conflicts are resolved. It cannot authenticate a community representative from this agreement, establish that community authority is legitimate, or control services that do not implement the evaluator.

The local Worker route is `POST /run`; requests include purpose, job type, model ID, contribution IDs, operation, output audience and clinical-use flag. Before using the route, configure a private `RESEARCHER_TOKEN` secret in the target environment. A deployment needs the `AI` binding and can incur model usage. This example does not enforce an agreement against copies of data or model weights that leave the participating service.
