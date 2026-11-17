import { describe, expect, it, vi } from 'vitest';
import agreementFixture from '../examples/portable-ai-worker/agreement.json';
import { createAgreementAIWorker } from '../examples/portable-ai-worker/src/worker';
import {
  evaluateCommunityAIAgreement,
  type CommunityAIAgreement,
} from '../packages/community-ai-agreement/src';

const requestBody = {
  purpose: 'community-wellbeing-research',
  jobType: 'theme-classification',
  modelId: '@cf/google/gemma-4-26b-a4b-it',
  contributionIds: ['synthetic-response-1', 'synthetic-response-2'],
  operation: 'inference',
  outputAudience: 'community',
  clinicalUse: false,
} as const;
const request = { ...requestBody, researcherId: 'fictional-researcher-1' };

function agreementCases() {
  const withdrawn = structuredClone(agreementFixture);
  withdrawn.contributions[1]!.permission.status = 'withdrawn';

  const requireAll = structuredClone(withdrawn);
  requireAll.withdrawalMode = 'require-all';

  const benefitPending = {
    ...structuredClone(agreementFixture),
    schemaVersion: '2.0.0',
    expiresAt: null,
    requiredBenefitObligationIds: ['fictional-summary'],
  } as Extract<CommunityAIAgreement, { schemaVersion: '2.0.0' }>;
  benefitPending.benefitObligations[0]!.status = 'proposed';
  benefitPending.benefitObligations[0]!.agreedByCommunity = false;
  benefitPending.benefitObligations[0]!.agreedBy = null;
  benefitPending.benefitObligations[0]!.acceptedByResearchTeam = false;
  benefitPending.benefitObligations[0]!.acceptedBy = null;

  const benefitAccepted = structuredClone(benefitPending);
  benefitAccepted.benefitObligations[0]!.status = 'accepted';
  benefitAccepted.benefitObligations[0]!.agreedByCommunity = true;
  benefitAccepted.benefitObligations[0]!.agreedBy = 'fictional-community-decision';
  benefitAccepted.benefitObligations[0]!.acceptedByResearchTeam = true;
  benefitAccepted.benefitObligations[0]!.acceptedBy = 'fictional-research-team';

  const missingBenefit = structuredClone(benefitAccepted);
  missingBenefit.requiredBenefitObligationIds = ['unlisted-obligation'];

  const future = structuredClone(agreementFixture);
  future.effectiveAt = '2027-01-01T00:00:00.000Z';

  const unsupported = { ...agreementFixture, schemaVersion: '3.0.0' };
  return [
    ['v1 allowed request', agreementFixture],
    ['individual permission withdrawal', withdrawn],
    ['collective require-all policy change', requireAll],
    ['v2 required benefit pending', benefitPending],
    ['v2 required benefit accepted', benefitAccepted],
    ['missing required benefit record', missingBenefit],
    ['future-effective policy', future],
    ['unsupported agreement version', unsupported],
  ] as const;
}

describe('portable Community AI Agreement conformance', () => {
  it.each(agreementCases())(
    'matches MindCommons and portable Worker for %s',
    async (_name, agreement) => {
      const mainServiceDecision = evaluateCommunityAIAgreement(agreement, request);
      const ai = { run: vi.fn(async () => ({ fictional: true })) };
      const response = await createAgreementAIWorker(agreement).fetch(
        new Request('https://portable.example/run', {
          method: 'POST',
          headers: { Authorization: 'Bearer test-only-token' },
          body: JSON.stringify(requestBody),
        }),
        {
          AI: ai,
          RESEARCHER_ID: 'fictional-researcher-1',
          RESEARCHER_TOKEN: 'test-only-token',
        },
      );
      const result = (await response.json()) as {
        decision?: unknown;
        evaluation?: unknown;
      };
      const portableServiceDecision = result.decision ?? result.evaluation;

      expect(portableServiceDecision).toEqual(mainServiceDecision);
      expect(response.status).toBe(mainServiceDecision.allowed ? 200 : 403);
      expect(ai.run).toHaveBeenCalledTimes(mainServiceDecision.allowed ? 1 : 0);
    },
  );

  it('withholds output when a required benefit changes after model execution starts', async () => {
    const accepted = structuredClone(agreementCases()[4][1]) as Extract<
      CommunityAIAgreement,
      { schemaVersion: '2.0.0' }
    >;
    const pending = structuredClone(accepted);
    pending.benefitObligations[0]!.status = 'proposed';
    pending.benefitObligations[0]!.agreedByCommunity = false;
    pending.benefitObligations[0]!.agreedBy = null;
    pending.benefitObligations[0]!.acceptedByResearchTeam = false;
    pending.benefitObligations[0]!.acceptedBy = null;
    let agreement = accepted;
    const readAgreement = vi.fn().mockImplementation(async () => {
      const current = agreement;
      agreement = pending;
      return current;
    });
    const ai = { run: vi.fn(async () => ({ fictional: 'output' })) };
    const response = await createAgreementAIWorker(readAgreement).fetch(
      new Request('https://portable.example/run', {
        method: 'POST',
        headers: { Authorization: 'Bearer test-only-token' },
        body: JSON.stringify(requestBody),
      }),
      {
        AI: ai,
        RESEARCHER_ID: 'fictional-researcher-1',
        RESEARCHER_TOKEN: 'test-only-token',
      },
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      status: 'withheld',
      error: 'authorization_changed_before_output_release',
      resultReleased: false,
    });
    expect(ai.run).toHaveBeenCalledOnce();
  });
});
