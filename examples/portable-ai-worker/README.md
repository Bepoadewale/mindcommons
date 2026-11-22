# Use the agreement in another small service

This example is a separate Cloudflare Worker. It loads a fictional Community AI Agreement and checks it before a fixed AI task. It shows how another service could use the same rules as MindCommons.

The example accepts agreement versions 1 and 2. Version 2 can require named community benefits to be agreed by the community and accepted by the research team before the task runs. The caller is authenticated with a private service token. The researcher identity comes from server settings, not a value supplied in the request. Requests use a fixed structure and cannot include a custom prompt, uploaded record or script.

This example is for local testing only. It is not deployed. Its tests use a substitute AI function and do not prove a live model call. You do not need Cloudflare credentials or an AI allowance to run the tests.

From the repository root:

```sh
npm install
npm run test:agreement
npx wrangler dev --config examples/portable-ai-worker/wrangler.jsonc
```

The agreement tests compare the same request in the main service and this small Worker. They check that withdrawal, policy changes, benefit rules, expired or unsupported agreements, and changes during a model task produce the expected result.

A service using this agreement should verify its caller separately, load the latest policy and permission facts, check the request before calling AI, send only approved records, and check the same facts again before sharing a result. If a rule changes while the model is working, withhold the result.

The example uses a fixed sample agreement so tests are repeatable. A real service must decide how it receives rule updates and withdrawals, how quickly old copies expire, and what happens when records disagree. The agreement does not verify a community representative's identity or authority. It cannot control services that do not use it, or copies of data and models outside those services.

The local route is `POST /run`. A live deployment would need a private `RESEARCHER_TOKEN`, an AI connection, and may use an account's AI allowance. Do not deploy or run live inference unless the account, model and cost limits have been checked and authorized.
