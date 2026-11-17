import { z } from 'zod';

export const DemoRoleSchema = z.enum([
  'community_representative',
  'researcher',
  'community_member',
]);
export const DemoContributorIdSchema = z.enum(['contributor-a', 'contributor-b', 'contributor-c']);
export type DemoContributorId = z.infer<typeof DemoContributorIdSchema>;
export const ResearchPurposeSchema = z.enum([
  'community-wellbeing-research',
  'community-access-research',
  'commercial-advertising',
]);
export const ResearchRequestSchema = z
  .object({
    purpose: ResearchPurposeSchema,
    jobType: z.literal('theme-classification'),
  })
  .strict();
export const PolicyDecisionSchema = z
  .object({
    proposalId: z.literal('proposal-v2'),
    decision: z.enum(['approve', 'reject']),
  })
  .strict();
export const PermissionActionSchema = z
  .object({
    contributorId: DemoContributorIdSchema,
    action: z.enum(['withdraw', 'grant']),
  })
  .strict();
export const ChangeDemoRoleSchema = z.object({ role: DemoRoleSchema }).strict();
export const BenefitActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('agree') }).strict(),
  z.object({ action: z.literal('accept') }).strict(),
  z.object({ action: z.literal('withdraw-acceptance') }).strict(),
  z
    .object({
      action: z.literal('submit-evidence'),
      evidence: z.enum(['accessible-summary-prepared', 'community-review-scheduled']),
    })
    .strict(),
  z
    .object({ action: z.literal('review'), outcome: z.enum(['accepted', 'changes-requested']) })
    .strict(),
]);

export const DecisionReceiptSchema = z
  .object({
    receiptVersion: z.literal('1.0.0'),
    decisionId: z.string().uuid(),
    timestamp: z.iso.datetime(),
    agreement: z
      .object({
        agreementId: z.string().min(1).max(120),
        schemaVersion: z.literal('2.0.0'),
        communityId: z.string().min(1).max(120),
        policyVersion: z.number().int().positive().nullable(),
        status: z.enum(['draft', 'active', 'superseded']),
        effectiveAt: z.iso.datetime().nullable(),
        permittedPurposes: z.array(ResearchPurposeSchema).max(20),
        commercialUseAllowed: z.boolean(),
        withdrawalMode: z.enum(['exclude-withdrawn', 'require-all']),
      })
      .strict(),
    request: z
      .object({
        datasetId: z.string().min(1).max(120),
        purpose: ResearchPurposeSchema,
        operation: z.literal('inference'),
        jobType: z.string().min(1).max(80),
        modelId: z.string().min(1).max(200),
        outputAudience: z.literal('community'),
        restrictions: z
          .object({
            allowedModelIds: z.array(z.string().min(1).max(200)).max(50),
            allowedJobTypes: z.array(z.string().min(1).max(80)).max(50),
            trainingAllowed: z.boolean(),
            publicOutputsAllowed: z.boolean(),
            clinicalUseAllowed: z.boolean(),
          })
          .strict(),
      })
      .strict(),
    contributions: z
      .array(
        z
          .object({
            contributionId: z.string().min(1).max(80),
            contributorId: DemoContributorIdSchema,
            purpose: ResearchPurposeSchema,
            permissionStatus: z.enum(['granted', 'withdrawn', 'expired']),
            permissionVersion: z.number().int().positive(),
            permissionExpiresAt: z.iso.datetime(),
            individualPermissionActive: z.boolean(),
            includedInJob: z.boolean(),
            exclusionReason: z.string().min(1).max(120).nullable(),
          })
          .strict(),
      )
      .max(1000),
    requiredBenefitConditions: z
      .array(
        z
          .object({
            obligationId: z.string().min(1).max(100),
            requiredBeforeExecution: z.boolean(),
            status: z.enum([
              'proposed',
              'agreed',
              'accepted',
              'evidence-recorded',
              'community-reviewed',
            ]),
            communityAgreed: z.boolean(),
            researchTeamAccepted: z.boolean(),
            dueAt: z.iso.datetime(),
          })
          .strict(),
      )
      .max(100),
    authorization: z
      .object({
        outcome: z.enum(['allowed', 'denied']),
        reasons: z.array(z.string().min(1).max(120)).max(30),
      })
      .strict(),
    execution: z
      .object({
        status: z.enum(['not-started', 'running', 'completed', 'failed', 'withheld']),
        inferenceAttempted: z.boolean(),
        inferenceMode: z.enum(['live', 'mock']).nullable(),
        modelId: z.string().min(1).max(200).nullable(),
        outputReleased: z.boolean(),
        reason: z.string().min(1).max(120).nullable(),
      })
      .strict(),
    correlationId: z.string().uuid(),
  })
  .strict();

export type DecisionReceipt = z.infer<typeof DecisionReceiptSchema>;

export type DemoRoleContract = z.infer<typeof DemoRoleSchema>;
export type ResearchRequestContract = z.infer<typeof ResearchRequestSchema>;
