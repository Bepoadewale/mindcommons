# System overview

## Implemented local prototype architecture (not deployed)

```mermaid
flowchart LR
  V[Reviewer browser] -->|static files| P[Cloudflare Pages]
  V -->|same-origin API; anonymous demo session| F[Pages Functions]
  F --> G[Deterministic authorization engine]
  F --> D[(D1: synthetic session, policy, permission, audit)]
  G -->|allowed fixed job only| AI[Workers AI]
  F -->|decision and bounded result| V
```

The static user interface is not an authority boundary. The function loads server-owned demo facts, applies role, policy, permission, purpose, job and expiry checks, writes decision evidence, and calls the Workers AI binding only for an allowed operation. A denied request ends before inference. Locally, the binding is replaced by a deterministic mock explicitly enabled for development; production inference has not been verified.

## Trust boundaries

- The browser is public and untrusted. Client-side validation helps usability only.
- A visitor session isolates fictional records; it is not verified identity or a real representative credential.
- The API and its D1 binding are the enforcement boundary for this prototype.
- Workers AI receives only a small fixed synthetic input and can fail or be unavailable.
- Cloudflare controls infrastructure and model execution. The demo does not prove removal from model weights or eliminate provider trust.
- GitHub Actions builds and checks source; deployment credentials, if later needed, must be scoped to the new project and kept out of source.

## State and records

Implemented records: short-lived demo session (two hours; 500 new sessions/day), community, policy proposal and effective version, fictional individual permission with purpose/expiry/withdrawal state, fixed research request, authorization decision, AI execution provenance, append-oriented audit event, and hypothetical benefit commitment. API requests are capped at 60 per minute per session and AI attempts at 100 per day. Do not store free-form health narratives.

## Failure behavior

Missing, expired, conflicting or unreadable authorization facts fail closed. D1 or AI service errors return a clear retryable error without claiming completion. Only successful calls are marked executed. Audit records are ordinary database evidence and can be altered by an operator with sufficient access; integrity fields are not tamper-proof guarantees.
