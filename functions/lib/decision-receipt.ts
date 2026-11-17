import type { DecisionReceipt } from '../../packages/contracts/src';
import type {
  AuthorizationDecision,
  AuthorizationFacts,
} from '../../packages/governance/src/authorization';
import {
  communityAgreementFromFacts,
  DEMO_DATASET_ID,
  DEMO_MODEL_ID,
} from '../../packages/governance/src/authorization';

export function createDecisionReceipt(
  decisionId: string,
  timestamp: string,
  correlationId: string,
  facts: AuthorizationFacts,
  decision: AuthorizationDecision,
): DecisionReceipt {
  const agreement = communityAgreementFromFacts(facts);
  const excludedById = new Map(
    decision.excludedContributions.map((item) => [item.contributionId, item.reason]),
  );
  const requiredBenefitIds = new Set(
    agreement.schemaVersion === '2.0.0' ? agreement.requiredBenefitObligationIds : [],
  );
  return {
    receiptVersion: '1.0.0',
    decisionId,
    timestamp,
    agreement: {
      agreementId: agreement.agreementId,
      schemaVersion: '2.0.0',
      communityId: agreement.communityId,
      policyVersion: facts.activePolicy?.version ?? null,
      status: agreement.status,
      effectiveAt: agreement.effectiveAt,
      permittedPurposes: agreement.permittedPurposes,
      commercialUseAllowed: agreement.commercialUseAllowed,
      withdrawalMode: agreement.withdrawalMode,
    },
    request: {
      datasetId: DEMO_DATASET_ID,
      purpose: facts.purpose,
      operation: 'inference',
      jobType: facts.jobType,
      modelId: DEMO_MODEL_ID,
      outputAudience: 'community',
      restrictions: {
        allowedModelIds: agreement.modelUse.allowedModelIds,
        allowedJobTypes: agreement.modelUse.allowedJobTypes,
        trainingAllowed: agreement.modelUse.trainingAllowed,
        publicOutputsAllowed: agreement.modelUse.publicOutputsAllowed,
        clinicalUseAllowed: agreement.modelUse.clinicalUseAllowed,
      },
    },
    contributions: facts.contributions.map((contribution) => {
      const permission = facts.permissions.find(
        (item) => item.permissionId === `${contribution.contributorId}:${contribution.purpose}`,
      );
      const individualPermissionActive = Boolean(
        permission &&
        permission.purpose === contribution.purpose &&
        permission.status === 'granted' &&
        Date.parse(permission.expiresAt) > facts.now.getTime(),
      );
      return {
        contributionId: contribution.contributionId,
        contributorId: contribution.contributorId,
        purpose: contribution.purpose,
        permissionStatus: permission?.status ?? 'expired',
        permissionVersion: permission?.version ?? 1,
        permissionExpiresAt: permission?.expiresAt ?? '1970-01-01T00:00:00.000Z',
        individualPermissionActive,
        includedInJob:
          decision.allowed &&
          decision.eligibleContributionIds.includes(contribution.contributionId),
        exclusionReason:
          excludedById.get(contribution.contributionId) ??
          (decision.allowed ? null : 'authorization-denied'),
      };
    }),
    requiredBenefitConditions: agreement.benefitObligations.map((obligation) => ({
      obligationId: obligation.obligationId,
      requiredBeforeExecution: requiredBenefitIds.has(obligation.obligationId),
      status: obligation.status,
      communityAgreed: obligation.agreedByCommunity,
      researchTeamAccepted: obligation.acceptedByResearchTeam,
      dueAt: obligation.dueAt,
    })),
    authorization: {
      outcome: decision.allowed ? 'allowed' : 'denied',
      reasons: decision.reasons,
    },
    execution: {
      status: 'not-started',
      inferenceAttempted: false,
      inferenceMode: null,
      modelId: null,
      outputReleased: false,
      reason: null,
    },
    correlationId,
  };
}
