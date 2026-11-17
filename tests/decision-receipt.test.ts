import { describe, expect, it } from 'vitest';
import { DecisionReceiptSchema } from '../packages/contracts/src';
import {
  authorizeResearch,
  permissionIdFor,
  SYNTHETIC_CONTRIBUTIONS,
  type AuthorizationFacts,
} from '../packages/governance/src/authorization';
import { createDecisionReceipt } from '../functions/lib/decision-receipt';

function facts(requiredBenefitObligationIds: string[] = []): AuthorizationFacts {
  return {
    actorRole: 'researcher',
    communityId: 'demo-community',
    activePolicy: {
      version: 1,
      status: 'active',
      allowedPurpose: 'community-wellbeing-research',
      commercialAllowed: false,
      withdrawalMode: 'exclude-withdrawn',
      effectiveAt: '2026-11-17T00:00:00.000Z',
      requiredBenefitObligationIds,
    },
    contributions: SYNTHETIC_CONTRIBUTIONS,
    permissions: SYNTHETIC_CONTRIBUTIONS.map((contribution) => ({
      permissionId: permissionIdFor(contribution.contributorId, contribution.purpose),
      purpose: contribution.purpose,
      status: 'granted',
      expiresAt: '2027-01-01T00:00:00.000Z',
      version: 1,
    })),
    purpose: 'community-wellbeing-research',
    jobType: 'theme-classification',
    now: new Date('2026-11-17T12:00:00.000Z'),
  };
}

describe('synthetic decision receipt', () => {
  it('validates an allowed decision without including output, session identity or raw narratives', () => {
    const authorizationFacts = facts();
    const decision = authorizeResearch(authorizationFacts);
    const receipt = createDecisionReceipt(
      'ea8fc338-6d74-4df7-90c5-315e50503d62',
      '2026-11-17T12:00:00.000Z',
      'e8f6d72b-269f-4b68-a0c5-5f3b665756cd',
      authorizationFacts,
      decision,
    );
    expect(DecisionReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(receipt.authorization.outcome).toBe('allowed');
    expect(receipt.contributions.every((item) => item.includedInJob)).toBe(true);
    expect(JSON.stringify(receipt)).not.toMatch(/sessionId|cookie|"output":|trusted local group/);
  });

  it('records a required but unmet benefit as a denial without implying inference occurred', () => {
    const authorizationFacts = facts(['fictional-accessible-summary']);
    const decision = authorizeResearch(authorizationFacts);
    const receipt = createDecisionReceipt(
      'ea8fc338-6d74-4df7-90c5-315e50503d62',
      '2026-11-17T12:00:00.000Z',
      'e8f6d72b-269f-4b68-a0c5-5f3b665756cd',
      authorizationFacts,
      decision,
    );
    expect(DecisionReceiptSchema.parse(receipt)).toEqual(receipt);
    expect(receipt.authorization.outcome).toBe('denied');
    expect(receipt.authorization.reasons).toContain('required-benefit-not-agreed');
    expect(receipt.execution).toEqual({
      status: 'not-started',
      inferenceAttempted: false,
      inferenceMode: null,
      modelId: null,
      outputReleased: false,
      reason: null,
    });
    expect(receipt.requiredBenefitConditions[0]).toMatchObject({
      obligationId: 'fictional-accessible-summary',
      requiredBeforeExecution: true,
      communityAgreed: false,
      researchTeamAccepted: false,
    });
    expect(
      receipt.contributions.every((item) => item.exclusionReason === 'authorization-denied'),
    ).toBe(true);
  });
});
