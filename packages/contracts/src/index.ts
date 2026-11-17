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

export type DemoRoleContract = z.infer<typeof DemoRoleSchema>;
export type ResearchRequestContract = z.infer<typeof ResearchRequestSchema>;
