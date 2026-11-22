# Community AI Agreement

This package contains a shared set of rules in a format software can read, plus a fixed TypeScript checker. A service can use it to decide whether a specific AI task may use specific contributions.

The agreement is for participating services. It is not a legal contract, a certificate, or proof that a community decision was fair. It cannot make other services follow the rules.

## What is in this folder?

- `schema.json` describes the allowed agreement fields.
- `src/index.ts` defines the data types, checks request data and decides whether a request passes.
- `../../examples/portable-ai-worker/` shows another small service using the checker.

## Agreement versions

Version 1 records the policy, permitted purposes, approved researchers, permission for each contribution, allowed models and tasks, limits on training and public outputs, and benefit information. In version 1, benefit information is recorded but does not block a task.

Version 2 can list benefit commitments that must be agreed to before a task runs. For each required commitment, the checker expects both community agreement and research-team acceptance. The benefit itself may be delivered later. If a required fact is missing or contradicts another fact, the checker denies the task.

The demo's normal policy has no required benefit. Its fictional proposal adds an accessible-results commitment so reviewers can see it block a task.

## Updating an agreement

Do not change an existing version 1 agreement to act like version 2. Keep version 1 documents unchanged. To use version 2, create a complete version 2 agreement, set its expiry (or explicitly set it to `null`), and list required benefit IDs. Then check that each required benefit has current community agreement and team acceptance.

Changing the version number alone is not enough. Run the schema check and the reference checker. The current demo builds agreements from its versioned database records. Database migration `0007_policy_benefit_prerequisites.sql` keeps existing policy behavior and adds the benefit requirement only to the fictional proposal.

## Example

```ts
import { evaluateCommunityAIAgreement } from './packages/community-ai-agreement/src';

const decision = evaluateCommunityAIAgreement(agreement, {
  researcherId: 'researcher-from-your-auth-system',
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

The surrounding service must verify the researcher's identity and connect the request to actual contribution records. The checker does not verify identity, prove that permission was freely given, decide whether the community process was legitimate, or inspect the model. Before sharing a result, the service must check the current rules and permissions again.

After changing the agreement type definitions, regenerate the JSON Schema:

```sh
npm run agreement:schema
```

The live demo exposes its fictional agreement at `/api/agreement` and the schema at `/api/agreement/schema`. These records belong to the current demo session.
