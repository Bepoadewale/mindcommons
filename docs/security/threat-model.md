# Threat model

## Assets

Prototype policy versions, fictional permission records, authorization results, AI-call budget, synthetic outputs, session isolation and truthful public claims. No real health information is an allowed asset.

## Adversaries and risks

- Anonymous visitor alters requests, claims a role, replays or floods endpoints, probes other sessions, or submits oversized input.
- A researcher requests an unapproved purpose, model or job type.
- A bug or missing database fact allows a denied operation to reach AI.
- Logs, browser storage or service-worker caches retain data unexpectedly.
- A cloud provider or privileged operator can access or change hosted records.
- A reviewer mistakes fictional roles, mock tests, or an ordinary audit table for real governance or immutable evidence.
- Resource exhaustion causes quota failure or unexpected paid activation.

## Controls to implement and verify

- Server-controlled opaque session, expiry and isolation; no client-supplied authority.
- Strict schemas, body-size and text limits; fixed job IDs/model IDs; no script upload or arbitrary prompt execution.
- Fail-closed authorization before AI; separate policy and individual permission checks; negative tests spy on AI binding.
- Same-origin API, restrictive CORS, security headers, safe text rendering, no secrets in browser.
- Application-level rate limits and a hard daily demo cap where practical; no automatic upgrade or paid fallback.
- Do not log submitted narratives; synthetic-only corpus; no API caching or browser persistence of sensitive records.
- Append-oriented decision events with correlation IDs, without claiming tamper resistance.
- Locked dependencies, CI least privilege, secret scanning, build and browser tests.

## Residual risks and scope

Public demos remain vulnerable to denial of service and service outages. Free-plan limits are account-level and may be shared with other projects. This prototype has no verified real identity, community authority, clinical controls, independent security audit, or patient-data suitability. A live provider executes model inference outside the community's infrastructure. A governance record cannot technically force deletion from copied datasets or model weights.
