import type { DemoContributorId } from '../../contracts/src';
import {
  evaluateCommunityAIAgreement,
  type CommunityAIAgreement,
} from '../../community-ai-agreement/src';

export type DemoRole = 'community_representative' | 'researcher' | 'community_member';
export type ResearchPurpose =
  'community-wellbeing-research' | 'community-access-research' | 'commercial-advertising';
export type JobType = 'theme-classification';
export type WithdrawalMode = 'exclude-withdrawn' | 'require-all';

export interface SyntheticContribution {
  contributionId: string;
  contributorId: DemoContributorId;
  purpose: Exclude<ResearchPurpose, 'commercial-advertising'>;
  text: string;
}

export interface PermissionFact {
  permissionId: string;
  purpose: string;
  status: 'granted' | 'withdrawn' | 'expired';
  expiresAt: string;
  version: number;
}

export const DEMO_PURPOSE: SyntheticContribution['purpose'] = 'community-wellbeing-research';

export const SYNTHETIC_CONTRIBUTIONS: SyntheticContribution[] = [
  {
    contributionId: 'response-a',
    contributorId: 'contributor-a',
    purpose: DEMO_PURPOSE,
    text: 'A trusted local group made wellbeing information easier to find.',
  },
  {
    contributionId: 'response-b',
    contributorId: 'contributor-b',
    purpose: DEMO_PURPOSE,
    text: 'Transport cost can make it harder to attend a community session.',
  },
  {
    contributionId: 'response-c',
    contributorId: 'contributor-c',
    purpose: DEMO_PURPOSE,
    text: 'A familiar community health worker helped explain where support is available.',
  },
];

export function permissionIdFor(contributorId: DemoContributorId, purpose: string): string {
  return `${contributorId}:${purpose}`;
}

export interface AuthorizationFacts {
  actorRole: DemoRole;
  communityId: string;
  activePolicy: {
    version: number;
    status: 'active' | 'superseded';
    allowedPurpose: string;
    commercialAllowed: boolean;
    withdrawalMode: WithdrawalMode;
    effectiveAt: string;
  } | null;
  contributions: SyntheticContribution[];
  permissions: PermissionFact[];
  purpose: ResearchPurpose;
  jobType: string;
  now: Date;
}

export interface AuthorizationDecision {
  allowed: boolean;
  policyVersion: number | null;
  reasons: string[];
  eligibleContributionIds: string[];
  excludedContributions: { contributionId: string; contributorId: string; reason: string }[];
}

export function communityAgreementFromFacts(facts: AuthorizationFacts): CommunityAIAgreement {
  const policy = facts.activePolicy;
  const permissionById = new Map(
    facts.permissions.map((permission) => [permission.permissionId, permission]),
  );
  const agreement: CommunityAIAgreement = {
    schemaVersion: '1.0.0',
    agreementId: `${facts.communityId}:policy:${policy?.version ?? 'none'}`,
    communityId: facts.communityId,
    policyVersion: policy?.version ?? 1,
    status: policy?.status ?? 'superseded',
    effectiveAt: policy?.effectiveAt ?? null,
    permittedPurposes: policy
      ? [
          policy.allowedPurpose as ResearchPurpose,
          ...(policy.commercialAllowed ? (['commercial-advertising'] as const) : []),
        ]
      : [],
    authorizedResearcherIds: ['demo:researcher'],
    commercialUseAllowed: policy?.commercialAllowed ?? false,
    withdrawalMode: policy?.withdrawalMode ?? 'require-all',
    contributions: facts.contributions.map((contribution) => {
      const permission = permissionById.get(
        permissionIdFor(contribution.contributorId, contribution.purpose),
      );
      return {
        contributionId: contribution.contributionId,
        contributorId: contribution.contributorId,
        purpose: contribution.purpose,
        permission: {
          purpose: (permission?.purpose as ResearchPurpose | undefined) ?? contribution.purpose,
          status: permission?.status ?? 'expired',
          version: permission?.version ?? 1,
          expiresAt: permission?.expiresAt ?? '1970-01-01T00:00:00.000Z',
        },
      };
    }),
    modelUse: {
      allowedModelIds: [DEMO_MODEL_ID],
      allowedJobTypes: ['theme-classification'],
      trainingAllowed: false,
      publicOutputsAllowed: false,
      clinicalUseAllowed: false,
    },
    benefitObligations: [
      {
        obligationId: 'fictional-accessible-summary',
        description:
          'Prepare and share a plain-language accessible summary of the fictional findings.',
        accountableParty: 'Fictional research team',
        dueAt: '2027-01-15T00:00:00.000Z',
        status: 'proposed',
        agreedByCommunity: false,
        acceptedByResearchTeam: false,
      },
    ],
  };
  return agreement;
}

export function authorizeResearch(facts: AuthorizationFacts): AuthorizationDecision {
  const agreement = communityAgreementFromFacts(facts);
  const evaluation = evaluateCommunityAIAgreement(
    agreement,
    {
      researcherId: 'demo:researcher',
      purpose: facts.purpose,
      jobType: facts.jobType,
      modelId: DEMO_MODEL_ID,
      contributionIds: facts.contributions.map((item) => item.contributionId),
      operation: 'inference',
      outputAudience: 'community',
      clinicalUse: false,
    },
    facts.now,
  );
  const reasonMap: Record<string, string> = {
    'no-effective-community-agreement': 'no-effective-community-policy',
    'job-type-not-allowlisted-by-agreement': 'job-type-not-allowlisted',
  };
  const reasons = evaluation.reasons.map((reason) => reasonMap[reason] ?? reason);
  if (facts.actorRole !== 'researcher') reasons.unshift('researcher-role-required');
  const allowed = evaluation.allowed && facts.actorRole === 'researcher';

  return {
    allowed,
    policyVersion: evaluation.policyVersion,
    reasons: allowed ? ['community-policy-allows-eligible-contributions'] : reasons,
    eligibleContributionIds: allowed ? evaluation.eligibleContributionIds : [],
    excludedContributions: evaluation.excludedContributions,
  };
}

export const DEMO_MODEL_ID = '@cf/google/gemma-4-26b-a4b-it';
export const DEMO_DATASET_ID = 'fictional-community-survey-v1';
export const SYNTHETIC_CORPUS = SYNTHETIC_CONTRIBUTIONS.map(
  (contribution) => `${contribution.contributionId}: ${contribution.text}`,
).join('\n');

export interface AIInferenceBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

export type ResearchExecution =
  | { status: 'denied'; decision: AuthorizationDecision }
  | {
      status: 'completed';
      decision: AuthorizationDecision;
      modelId: string;
      output: unknown;
      inputContributionIds: string[];
    };

function publicInferenceOutput(output: unknown): unknown {
  if (!output || typeof output !== 'object' || !('choices' in output)) return output;
  const choices = output.choices;
  if (!Array.isArray(choices)) return output;
  const first = choices[0];
  const message = first && typeof first === 'object' && 'message' in first ? first.message : null;
  const content =
    message && typeof message === 'object' && 'content' in message ? message.content : null;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('The model returned no user-facing answer.');
  }
  return { text: content.trim() };
}

export async function executeResearch(
  facts: AuthorizationFacts,
  inference: AIInferenceBinding,
): Promise<ResearchExecution> {
  const decision = authorizeResearch(facts);
  if (!decision.allowed) return { status: 'denied', decision };

  const selected = new Set(decision.eligibleContributionIds);
  const corpus = facts.contributions
    .filter((contribution) => selected.has(contribution.contributionId))
    .map((contribution) => `${contribution.contributionId}: ${contribution.text}`)
    .join('\n');

  const modelOutput = await inference.run(DEMO_MODEL_ID, {
    messages: [
      {
        role: 'system',
        content:
          'Group the supplied fictional survey snippets into up to three broad themes. Return concise JSON with a themes array. Do not diagnose, advise, or infer anything about a real person. All records are synthetic.',
      },
      { role: 'user', content: corpus },
    ],
    max_completion_tokens: 180,
    chat_template_kwargs: { enable_thinking: false },
  });
  const output = publicInferenceOutput(modelOutput);
  return {
    status: 'completed',
    decision,
    modelId: DEMO_MODEL_ID,
    output,
    inputContributionIds: decision.eligibleContributionIds,
  };
}
