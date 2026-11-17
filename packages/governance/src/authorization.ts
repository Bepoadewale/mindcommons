import type { DemoContributorId } from '../../contracts/src';

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

export function authorizeResearch(facts: AuthorizationFacts): AuthorizationDecision {
  const reasons: string[] = [];
  const policy = facts.activePolicy;
  const permissionById = new Map(
    facts.permissions.map((permission) => [permission.permissionId, permission]),
  );
  const eligibleContributionIds: string[] = [];
  const excludedContributions: AuthorizationDecision['excludedContributions'] = [];

  if (facts.actorRole !== 'researcher') reasons.push('researcher-role-required');
  if (!policy || policy.status !== 'active') reasons.push('no-effective-community-policy');
  if (policy && facts.purpose === 'commercial-advertising' && !policy.commercialAllowed) {
    reasons.push('community-policy-prohibits-commercial-use');
  }
  if (
    policy &&
    facts.purpose !== 'commercial-advertising' &&
    facts.purpose !== policy.allowedPurpose
  ) {
    reasons.push('purpose-not-approved-by-community-policy');
  }
  for (const contribution of facts.contributions) {
    const permissionId = permissionIdFor(contribution.contributorId, contribution.purpose);
    const permission = permissionById.get(permissionId);
    let exclusionReason: string | null = null;
    if (contribution.purpose !== facts.purpose) {
      exclusionReason = 'contribution-purpose-does-not-match-request';
    } else if (!permission) {
      exclusionReason = 'individual-permission-missing';
    } else if (permission.purpose !== contribution.purpose) {
      exclusionReason = 'individual-purpose-does-not-match-contribution';
    } else if (permission.status !== 'granted') {
      exclusionReason = 'individual-permission-not-active';
    } else if (Date.parse(permission.expiresAt) <= facts.now.getTime()) {
      exclusionReason = 'individual-permission-expired';
    }

    if (exclusionReason) {
      excludedContributions.push({
        contributionId: contribution.contributionId,
        contributorId: contribution.contributorId,
        reason: exclusionReason,
      });
    } else {
      eligibleContributionIds.push(contribution.contributionId);
    }
  }
  if (facts.jobType !== 'theme-classification') reasons.push('job-type-not-allowlisted');

  if (facts.activePolicy?.withdrawalMode === 'require-all' && excludedContributions.length > 0) {
    reasons.push('community-policy-requires-all-contributors-to-have-active-permission');
  }
  if (
    facts.activePolicy?.withdrawalMode === 'exclude-withdrawn' &&
    eligibleContributionIds.length === 0
  ) {
    reasons.push('no-contributor-records-authorized');
  }

  const allowed = reasons.length === 0;

  return {
    allowed,
    policyVersion: policy?.status === 'active' ? policy.version : null,
    reasons: allowed ? ['community-policy-allows-eligible-contributions'] : reasons,
    eligibleContributionIds: allowed ? eligibleContributionIds : [],
    excludedContributions,
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
