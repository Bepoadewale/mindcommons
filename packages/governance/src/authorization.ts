export type DemoRole = 'community_representative' | 'researcher' | 'community_member';
export type ResearchPurpose = 'community-wellbeing-research' | 'commercial-advertising';
export type JobType = 'theme-classification';

export interface AuthorizationFacts {
  actorRole: DemoRole;
  communityId: string;
  activePolicy: {
    version: number;
    status: 'active' | 'superseded';
    allowedPurpose: string;
    commercialAllowed: boolean;
  } | null;
  permission: {
    purpose: string;
    status: 'granted' | 'withdrawn' | 'expired';
    expiresAt: string;
  } | null;
  purpose: ResearchPurpose;
  jobType: string;
  now: Date;
}

export interface AuthorizationDecision {
  allowed: boolean;
  policyVersion: number | null;
  reasons: string[];
}

export function authorizeResearch(facts: AuthorizationFacts): AuthorizationDecision {
  const reasons: string[] = [];
  const policy = facts.activePolicy;
  const permission = facts.permission;

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
  if (!permission || permission.status !== 'granted')
    reasons.push('individual-permission-not-active');
  if (permission && permission.purpose !== facts.purpose)
    reasons.push('individual-purpose-does-not-match');
  if (permission && Date.parse(permission.expiresAt) <= facts.now.getTime()) {
    reasons.push('individual-permission-expired');
  }
  if (facts.jobType !== 'theme-classification') reasons.push('job-type-not-allowlisted');

  return {
    allowed: reasons.length === 0,
    policyVersion: policy?.status === 'active' ? policy.version : null,
    reasons:
      reasons.length === 0
        ? ['community-policy-and-individual-permission-allow-this-job']
        : reasons,
  };
}

export const DEMO_MODEL_ID = '@cf/google/gemma-4-26b-a4b-it';
export const DEMO_DATASET_ID = 'fictional-community-survey-v1';
export const SYNTHETIC_CORPUS = [
  'Fictional participant A says a trusted local group made wellbeing information easier to find.',
  'Fictional participant B says transport cost can make it harder to attend a community session.',
  'Fictional participant C says a familiar community health worker helped explain where support is available.',
].join('\n');

export interface AIInferenceBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

export type ResearchExecution =
  | { status: 'denied'; decision: AuthorizationDecision }
  | { status: 'completed'; decision: AuthorizationDecision; modelId: string; output: unknown };

export async function executeResearch(
  facts: AuthorizationFacts,
  inference: AIInferenceBinding,
): Promise<ResearchExecution> {
  const decision = authorizeResearch(facts);
  if (!decision.allowed) return { status: 'denied', decision };

  const output = await inference.run(DEMO_MODEL_ID, {
    messages: [
      {
        role: 'system',
        content:
          'Group the supplied fictional survey snippets into up to three broad themes. Return concise JSON with a themes array. Do not diagnose, advise, or infer anything about a real person. All records are synthetic.',
      },
      { role: 'user', content: SYNTHETIC_CORPUS },
    ],
    max_completion_tokens: 180,
  });
  return { status: 'completed', decision, modelId: DEMO_MODEL_ID, output };
}
