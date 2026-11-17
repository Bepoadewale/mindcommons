import { describe, expect, it, vi } from 'vitest';
import {
  authorizeResearch,
  DEMO_MODEL_ID,
  executeResearch,
  SYNTHETIC_CORPUS,
  type AuthorizationFacts,
  type AIInferenceBinding,
} from '../packages/governance/src/authorization';
import {
  BenefitEvidenceSchema,
  ChangeDemoRoleSchema,
  ResearchRequestSchema,
} from '../packages/contracts/src';

function facts(overrides: Partial<AuthorizationFacts> = {}): AuthorizationFacts {
  return {
    actorRole: 'researcher',
    communityId: 'demo-community',
    activePolicy: {
      version: 2,
      status: 'active',
      allowedPurpose: 'community-wellbeing-research',
      commercialAllowed: false,
    },
    permission: {
      purpose: 'community-wellbeing-research',
      status: 'granted',
      expiresAt: '2027-01-01T00:00:00.000Z',
    },
    purpose: 'community-wellbeing-research',
    jobType: 'theme-classification',
    now: new Date('2026-11-16T12:00:00.000Z'),
    ...overrides,
  };
}

describe('server-side research authorization', () => {
  it('allows a fixed job when the role, active community policy, and individual permission all match', () => {
    expect(authorizeResearch(facts())).toEqual({
      allowed: true,
      policyVersion: 2,
      reasons: ['community-policy-and-individual-permission-allow-this-job'],
    });
  });

  it('does not let a community representative submit a research job', () => {
    expect(authorizeResearch(facts({ actorRole: 'community_representative' })).reasons).toContain(
      'researcher-role-required',
    );
  });

  it('rejects commercial advertising under the active community policy', () => {
    const result = authorizeResearch(facts({ purpose: 'commercial-advertising' }));
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain('community-policy-prohibits-commercial-use');
  });

  it.each([
    ['withdrawn', { status: 'withdrawn' as const }],
    ['expired status', { status: 'expired' as const }],
    ['missing permission', null],
  ])('denies new processing when individual permission is %s', (_name, permission) => {
    expect(
      authorizeResearch(
        facts({ permission: permission ? { ...facts().permission!, ...permission } : null }),
      ).allowed,
    ).toBe(false);
  });

  it('checks the timestamp even when a record still says granted', () => {
    const result = authorizeResearch(
      facts({ permission: { ...facts().permission!, expiresAt: '2026-11-16T11:59:59.000Z' } }),
    );
    expect(result.reasons).toContain('individual-permission-expired');
  });

  it('fails closed when an effective policy is missing or superseded', () => {
    expect(authorizeResearch(facts({ activePolicy: null })).reasons).toContain(
      'no-effective-community-policy',
    );
    expect(
      authorizeResearch(facts({ activePolicy: { ...facts().activePolicy!, status: 'superseded' } }))
        .allowed,
    ).toBe(false);
  });

  it('rejects unapproved purposes and unlisted job types', () => {
    expect(authorizeResearch(facts({ purpose: 'commercial-advertising' })).reasons).toContain(
      'individual-purpose-does-not-match',
    );
    expect(authorizeResearch(facts({ jobType: 'arbitrary-script' })).reasons).toContain(
      'job-type-not-allowlisted',
    );
  });
});

describe('AI execution boundary', () => {
  it('calls only the selected model with a fixed synthetic corpus after approval', async () => {
    const run = vi.fn(async () => ({ themes: ['fictional theme'] }));
    const result = await executeResearch(facts(), { run } as unknown as AIInferenceBinding);
    expect(result.status).toBe('completed');
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(
      DEMO_MODEL_ID,
      expect.objectContaining({
        max_completion_tokens: 180,
        chat_template_kwargs: { enable_thinking: false },
      }),
    );
    expect(JSON.stringify(run.mock.calls[0])).not.toContain('patient');
    expect(SYNTHETIC_CORPUS).toContain('Fictional participant');
  });

  it('never invokes the model for a denied request', async () => {
    const run = vi.fn();
    const result = await executeResearch(facts({ purpose: 'commercial-advertising' }), {
      run,
    } as unknown as AIInferenceBinding);
    expect(result.status).toBe('denied');
    expect(run).not.toHaveBeenCalled();
  });

  it('returns only visible model text and excludes reasoning output', async () => {
    const run = vi.fn(async () => ({
      choices: [
        {
          message: {
            content: '```json\n{"themes":["fictional theme"]}\n```',
            reasoning_content: 'private reasoning',
          },
        },
      ],
    }));
    const result = await executeResearch(facts(), { run } as unknown as AIInferenceBinding);
    expect(result).toMatchObject({
      status: 'completed',
      output: { text: '```json\n{"themes":["fictional theme"]}\n```' },
    });
    expect(JSON.stringify(result)).not.toContain('private reasoning');
  });

  it('does not mark an empty model answer as a completed run', async () => {
    const run = vi.fn(async () => ({ choices: [{ message: { content: '' } }] }));
    await expect(
      executeResearch(facts(), { run } as unknown as AIInferenceBinding),
    ).rejects.toThrow('The model returned no user-facing answer.');
  });
});

describe('strict request contracts', () => {
  it('accepts only enumerated demo roles', () => {
    expect(ChangeDemoRoleSchema.safeParse({ role: 'researcher' }).success).toBe(true);
    expect(ChangeDemoRoleSchema.safeParse({ role: 'administrator' }).success).toBe(false);
  });

  it('rejects arbitrary prompts, extra fields, and unsupported jobs', () => {
    expect(
      ResearchRequestSchema.safeParse({
        purpose: 'community-wellbeing-research',
        jobType: 'theme-classification',
      }).success,
    ).toBe(true);
    expect(
      ResearchRequestSchema.safeParse({
        purpose: 'community-wellbeing-research',
        jobType: 'shell',
        script: 'echo hi',
      }).success,
    ).toBe(false);
    expect(
      ResearchRequestSchema.safeParse({
        purpose: 'community-wellbeing-research',
        jobType: 'theme-classification',
        prompt: 'anything',
      }).success,
    ).toBe(false);
  });

  it('accepts only predefined fictional benefit evidence, never free-text participant data', () => {
    expect(
      BenefitEvidenceSchema.safeParse({ evidence: 'accessible-summary-prepared' }).success,
    ).toBe(true);
    expect(
      BenefitEvidenceSchema.safeParse({ evidence: 'participant Alice said ...' }).success,
    ).toBe(false);
  });
});
