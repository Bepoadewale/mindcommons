import { z } from 'zod';

export const DemoRoleSchema = z.enum([
  'community_representative',
  'researcher',
  'community_member',
]);
export const ResearchRequestSchema = z
  .object({
    purpose: z.enum(['community-wellbeing-research', 'commercial-advertising']),
    jobType: z.literal('theme-classification'),
  })
  .strict();
export const PolicyDecisionSchema = z
  .object({
    proposalId: z.literal('proposal-v2'),
    decision: z.enum(['approve', 'reject']),
  })
  .strict();
export const PermissionActionSchema = z.object({ action: z.enum(['withdraw', 'grant']) }).strict();
export const ChangeDemoRoleSchema = z.object({ role: DemoRoleSchema }).strict();
export const BenefitEvidenceSchema = z
  .object({ evidence: z.enum(['accessible-summary-prepared', 'community-review-scheduled']) })
  .strict();

export type DemoRoleContract = z.infer<typeof DemoRoleSchema>;
export type ResearchRequestContract = z.infer<typeof ResearchRequestSchema>;
