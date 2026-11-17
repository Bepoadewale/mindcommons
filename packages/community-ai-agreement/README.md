# Community AI Agreement, version 1

This directory contains a reusable agreement schema and a deterministic TypeScript reference evaluator. The agreement is a machine-readable description of a community policy for a participating service; it is not a legal contract, cryptographic proof, or control over copies that leave that service.

## Contents

- `schema.json` is the JSON Schema Draft 2020-12 representation.
- `src/index.ts` contains the Zod schema, TypeScript types, request schema, and fail-closed evaluator.
- `../../examples/portable-ai-worker/` is a separate minimal Worker using the same evaluator before inference and again before releasing output.

The agreement records its schema version and active policy version; permitted research purposes; authorized researcher identifiers; contributor-specific purposes, permission versions, statuses and expiries; allowed model identifiers and job types; training, public-output and clinical-use restrictions; and benefit obligations with community agreement and research-team acceptance states.

## Evaluate an operation

```ts
import {
  evaluateCommunityAIAgreement,
  type CommunityAIAgreement,
} from './packages/community-ai-agreement/src';

const decision = evaluateCommunityAIAgreement(agreement, {
  researcherId: 'researcher-from-your-auth-layer',
  purpose: 'community-wellbeing-research',
  jobType: 'theme-classification',
  modelId: '@cf/google/gemma-4-26b-a4b-it',
  contributionIds: ['response-a', 'response-b'],
  operation: 'inference',
  outputAudience: 'community',
  clinicalUse: false,
});

if (!decision.allowed) throw new Error(decision.reasons.join(', '));
```

The caller must authenticate the researcher and bind the request to actual contribution records. The evaluator does not authenticate identities, verify a community's legitimate decision process, prove that a listed permission was freely given, or inspect model internals. An integration must re-read the effective agreement before releasing output and withhold results if its policy or applicable permissions changed during execution.

Regenerate the committed JSON Schema after editing the Zod contract:

```sh
npm run agreement:schema
```

The MindCommons demo exposes the current synthetic session agreement at `/api/agreement` and the schema at `/api/agreement/schema`. These endpoints are session-specific and return fictional values.
