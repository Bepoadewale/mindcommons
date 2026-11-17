# Community AI Agreement, versions 1 and 2

This directory contains a reusable agreement schema and a deterministic TypeScript reference evaluator. The agreement is a machine-readable description of a community policy for a participating service; it is not a legal contract, cryptographic proof, or control over copies that leave that service.

## Contents

- `schema.json` is the JSON Schema Draft 2020-12 representation.
- `src/index.ts` contains the Zod schema, TypeScript types, request schema, and fail-closed evaluator.
- `../../examples/portable-ai-worker/` is a separate minimal Worker using the same evaluator before inference and again before releasing output.

Version 1 records its original schema and continues to evaluate with its original semantics. It includes the active policy version; permitted research purposes; authorized researcher identifiers; contributor-specific purposes, permission versions, statuses and expiries; allowed model identifiers and job types; training, public-output and clinical-use restrictions; and benefit obligations. Version 1 benefit records are informational; they are not silently upgraded into execution prerequisites.

Version 2 adds an optional agreement expiry and `requiredBenefitObligationIds`. Only obligations explicitly listed there block execution. For each listed obligation, the evaluator requires a consistent community-agreed state and research-team acceptance. Delivery can remain due later. Missing or contradictory benefit facts fail closed with explicit reasons. The active demo policy starts with an empty prerequisite list; the fictional reviewed proposal adds `benefit-findings` to the list.

## Version migration

Keep existing `1.0.0` documents unchanged. To adopt the new behavior, create a `2.0.0` agreement, add `expiresAt` (`null` when there is no fixed expiry), and add `requiredBenefitObligationIds` (an empty array preserves non-gating benefit tracking). Then ensure each required obligation has current community agreement and research-team acceptance facts. Do not change only the version string: validate the complete v2 schema and evaluate it with the reference evaluator. The current demo constructs v2 from its versioned D1 policy and benefit records; D1 migration `0007_policy_benefit_prerequisites.sql` leaves existing policies non-gating and updates the fictional proposal.

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

The MindCommons demo exposes the current synthetic session agreement at `/api/agreement` and the v1/v2 JSON Schema at `/api/agreement/schema`. These endpoints are session-specific and return fictional values.
