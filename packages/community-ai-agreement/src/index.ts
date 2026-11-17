import { z } from 'zod';

const PurposeSchema = z.enum([
  'community-wellbeing-research',
  'community-access-research',
  'commercial-advertising',
]);
const ContributionSchema = z
  .object({
    contributionId: z.string().min(1).max(80),
    contributorId: z.string().min(1).max(80),
    purpose: PurposeSchema,
    permission: z
      .object({
        purpose: PurposeSchema,
        status: z.enum(['granted', 'withdrawn', 'expired']),
        version: z.number().int().positive(),
        expiresAt: z.iso.datetime(),
      })
      .strict(),
  })
  .strict();

export const CommunityAIAgreementSchema = z
  .object({
    schemaVersion: z.literal('1.0.0'),
    agreementId: z.string().min(1).max(120),
    communityId: z.string().min(1).max(120),
    policyVersion: z.number().int().positive(),
    status: z.enum(['draft', 'active', 'superseded']),
    effectiveAt: z.iso.datetime().nullable(),
    permittedPurposes: z.array(PurposeSchema).max(20),
    authorizedResearcherIds: z.array(z.string().min(1).max(120)).max(100),
    commercialUseAllowed: z.boolean(),
    withdrawalMode: z.enum(['exclude-withdrawn', 'require-all']),
    contributions: z.array(ContributionSchema).max(1000),
    modelUse: z
      .object({
        allowedModelIds: z.array(z.string().min(1).max(200)).max(50),
        allowedJobTypes: z.array(z.string().min(1).max(80)).max(50),
        trainingAllowed: z.boolean(),
        publicOutputsAllowed: z.boolean(),
        clinicalUseAllowed: z.boolean(),
      })
      .strict(),
    benefitObligations: z
      .array(
        z
          .object({
            obligationId: z.string().min(1).max(100),
            description: z.string().min(1).max(500),
            accountableParty: z.string().min(1).max(120),
            dueAt: z.iso.datetime(),
            status: z.enum([
              'proposed',
              'agreed',
              'accepted',
              'evidence-recorded',
              'community-reviewed',
            ]),
            agreedByCommunity: z.boolean(),
            agreedBy: z.string().max(120).nullable(),
            acceptedByResearchTeam: z.boolean(),
            acceptedBy: z.string().max(120).nullable(),
            evidence: z.string().max(500).nullable(),
            reviewOutcome: z.enum(['accepted', 'changes-requested']).nullable(),
            reviewedBy: z.string().max(120).nullable(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();

export type CommunityAIAgreement = z.infer<typeof CommunityAIAgreementSchema>;

export const AgreementEvaluationRequestSchema = z
  .object({
    researcherId: z.string().min(1).max(120),
    purpose: PurposeSchema,
    jobType: z.string().min(1).max(80),
    modelId: z.string().min(1).max(200),
    contributionIds: z.array(z.string().min(1).max(80)).min(1).max(1000),
    operation: z.enum(['inference', 'training']),
    outputAudience: z.enum(['private', 'community', 'public']),
    clinicalUse: z.boolean(),
  })
  .strict();

export type AgreementEvaluationRequest = z.infer<typeof AgreementEvaluationRequestSchema>;

export interface AgreementEvaluation {
  allowed: boolean;
  agreementId: string | null;
  policyVersion: number | null;
  reasons: string[];
  eligibleContributionIds: string[];
  permissionVersions: { contributionId: string; permissionVersion: number }[];
  excludedContributions: { contributionId: string; contributorId: string; reason: string }[];
}

export function evaluateCommunityAIAgreement(
  untrustedAgreement: unknown,
  untrustedRequest: unknown,
  now = new Date(),
): AgreementEvaluation {
  const agreementResult = CommunityAIAgreementSchema.safeParse(untrustedAgreement);
  const requestResult = AgreementEvaluationRequestSchema.safeParse(untrustedRequest);
  if (!agreementResult.success || !requestResult.success) {
    return {
      allowed: false,
      agreementId: null,
      policyVersion: null,
      reasons: ['agreement-or-request-invalid'],
      eligibleContributionIds: [],
      permissionVersions: [],
      excludedContributions: [],
    };
  }

  const agreement = agreementResult.data;
  const request = requestResult.data;
  if (
    new Set(agreement.contributions.map((contribution) => contribution.contributionId)).size !==
      agreement.contributions.length ||
    new Set(request.contributionIds).size !== request.contributionIds.length
  ) {
    return {
      allowed: false,
      agreementId: agreement.agreementId,
      policyVersion: null,
      reasons: ['duplicate-contribution-identifiers'],
      eligibleContributionIds: [],
      permissionVersions: [],
      excludedContributions: [],
    };
  }
  const reasons: string[] = [];
  const excludedContributions: AgreementEvaluation['excludedContributions'] = [];
  const eligibleContributionIds: string[] = [];
  const contributionsById = new Map(
    agreement.contributions.map((contribution) => [contribution.contributionId, contribution]),
  );

  if (agreement.status !== 'active' || !agreement.effectiveAt) {
    reasons.push('no-effective-community-agreement');
  }
  if (!agreement.authorizedResearcherIds.includes(request.researcherId)) {
    reasons.push('researcher-not-authorized-by-agreement');
  }
  if (!agreement.permittedPurposes.includes(request.purpose)) {
    reasons.push(
      request.purpose === 'commercial-advertising'
        ? 'community-policy-prohibits-commercial-use'
        : 'purpose-not-approved-by-community-policy',
    );
  }
  if (request.purpose === 'commercial-advertising' && !agreement.commercialUseAllowed) {
    if (!reasons.includes('community-policy-prohibits-commercial-use')) {
      reasons.push('community-policy-prohibits-commercial-use');
    }
  }
  if (!agreement.modelUse.allowedModelIds.includes(request.modelId)) {
    reasons.push('model-not-allowlisted-by-agreement');
  }
  if (!agreement.modelUse.allowedJobTypes.includes(request.jobType)) {
    reasons.push('job-type-not-allowlisted-by-agreement');
  }
  if (request.operation === 'training' && !agreement.modelUse.trainingAllowed) {
    reasons.push('model-training-prohibited-by-agreement');
  }
  if (request.outputAudience === 'public' && !agreement.modelUse.publicOutputsAllowed) {
    reasons.push('public-output-prohibited-by-agreement');
  }
  if (request.clinicalUse && !agreement.modelUse.clinicalUseAllowed) {
    reasons.push('clinical-use-prohibited-by-agreement');
  }

  for (const contributionId of request.contributionIds) {
    const contribution = contributionsById.get(contributionId);
    let reason: string | null = null;
    if (!contribution) {
      reason = 'contribution-not-listed-in-agreement';
    } else if (contribution.purpose !== request.purpose) {
      reason = 'contribution-purpose-does-not-match-request';
    } else if (contribution.permission.purpose !== contribution.purpose) {
      reason = 'individual-purpose-does-not-match-contribution';
    } else if (contribution.permission.status !== 'granted') {
      reason = 'individual-permission-not-active';
    } else if (Date.parse(contribution.permission.expiresAt) <= now.getTime()) {
      reason = 'individual-permission-expired';
    }

    if (reason) {
      excludedContributions.push({
        contributionId,
        contributorId: contribution?.contributorId ?? 'unknown',
        reason,
      });
    } else {
      eligibleContributionIds.push(contributionId);
    }
  }

  if (agreement.withdrawalMode === 'require-all' && excludedContributions.length > 0) {
    reasons.push('community-policy-requires-all-contributors-to-have-active-permission');
  }
  if (eligibleContributionIds.length === 0) reasons.push('no-contributor-records-authorized');

  const allowed = reasons.length === 0;
  return {
    allowed,
    agreementId: agreement.agreementId,
    policyVersion: agreement.status === 'active' ? agreement.policyVersion : null,
    reasons: allowed ? ['community-agreement-allows-eligible-contributions'] : reasons,
    eligibleContributionIds: allowed ? eligibleContributionIds : [],
    permissionVersions: allowed
      ? eligibleContributionIds.map((contributionId) => ({
          contributionId,
          permissionVersion: contributionsById.get(contributionId)!.permission.version,
        }))
      : [],
    excludedContributions,
  };
}

export function communityAIAgreementJsonSchema(): Record<string, unknown> {
  return z.toJSONSchema(CommunityAIAgreementSchema, {
    target: 'draft-2020-12',
    io: 'input',
  }) as Record<string, unknown>;
}
