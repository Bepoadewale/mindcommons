# Portable agreement: minimal AI service example

This is a separate, minimal Cloudflare Worker that loads a static, fictional Community AI Agreement and checks it before calling a fixed Workers AI binding. The agreement lists which fictional researcher principal is allowed. A service token authenticates the caller; the Worker takes the researcher identity from server-side configuration rather than trusting a body field. It accepts a structured request, never accepts user-supplied prompts or records, and includes only contributions selected by the evaluator.

The fixture is synthetic. The Worker is an independently testable reference example; it is not deployed and its test double does not prove a live model call. `wrangler.jsonc` documents the binding needed if a maintainer later runs it with an authorized Workers AI account. Keep it on a free plan and check the current model's allowance before any live request.

From the repository root:

```sh
npm install
npm test -- --run
npx wrangler dev --config examples/portable-ai-worker/wrangler.jsonc
```

The local Worker route is `POST /run`; requests include purpose, job type, model ID, contribution IDs, operation, output audience and clinical-use flag. Before using the route, configure a private `RESEARCHER_TOKEN` secret in the target environment. A deployment needs the `AI` binding and can incur model usage. This example does not enforce an agreement against copies of data or model weights that leave the participating service.
