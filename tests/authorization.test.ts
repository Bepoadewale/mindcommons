import { describe, expect, it, vi } from 'vitest';
import {
  authorizeResearch,
  DEMO_MODEL_ID,
  executeResearch,
  SYNTHETIC_CORPUS,
  SYNTHETIC_CONTRIBUTIONS,
  permissionIdFor,
  type AuthorizationFacts,
  type AIInferenceBinding,
} from '../packages/governance/src/authorization';
import {
  BenefitActionSchema,
  ChangeDemoRoleSchema,
  PermissionActionSchema,
  ResearchRequestSchema,
} from '../packages/contracts/src';

function facts(overrides: Partial<AuthorizationFacts> = {}): AuthorizationFacts {
  const contributions = overrides.contributions ?? SYNTHETIC_CONTRIBUTIONS;
  const permissions =
    overrides.permissions ??
    contributions.map((contribution) => ({
      permissionId: permissionIdFor(contribution.contributorId, contribution.purpose),
      purpose: contribution.purpose,
      status: 'granted' as const,
      expiresAt: '2027-01-01T00:00:00.000Z',
      version: 1,
    }));
  return {
    actorRole: 'researcher',
    communityId: 'demo-community',
    activePolicy: {
      version: 2,
      status: 'active',
      allowedPurpose: 'community-wellbeing-research',
      commercialAllowed: false,
      withdrawalMode: 'exclude-withdrawn',
      effectiveAt: '2026-11-16T12:00:00.000Z',
    },
    contributions,
    permissions,
    purpose: 'community-wellbeing-research',
    jobType: 'theme-classification',
    now: new Date('2026-11-16T12:00:00.000Z'),
    ...overrides,
  };
}

describe('server-side research authorization', () => {
  it('allows the fixed job only for contributions with matching active purpose permissions', () => {
    expect(authorizeResearch(facts())).toEqual({
      allowed: true,
      policyVersion: 2,
      reasons: ['community-policy-allows-eligible-contributions'],
      eligibleContributionIds: ['response-a', 'response-b', 'response-c'],
      excludedContributions: [],
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

  it.each(['contributor-a', 'contributor-b', 'contributor-c'] as const)(
    'excludes only %s when that contributor withdraws under the active exclusion policy',
    (contributorId) => {
      const records = facts().permissions.map((permission) =>
        permission.permissionId.startsWith(`${contributorId}:`)
          ? { ...permission, status: 'withdrawn' as const, version: 2 }
          : permission,
      );
      const result = authorizeResearch(facts({ permissions: records }));
      const contribution = SYNTHETIC_CONTRIBUTIONS.find(
        (item) => item.contributorId === contributorId,
      )!;
      expect(result.allowed).toBe(true);
      expect(result.eligibleContributionIds).not.toContain(contribution.contributionId);
      expect(result.excludedContributions).toContainEqual({
        contributionId: contribution.contributionId,
        contributorId,
        reason: 'individual-permission-not-active',
      });
    },
  );

  it('blocks the same request when the approved policy requires every contributor', () => {
    const permissions = facts().permissions.map((permission) =>
      permission.permissionId.startsWith('contributor-b:')
        ? { ...permission, status: 'withdrawn' as const, version: 2 }
        : permission,
    );
    const beforeProposal = authorizeResearch(facts({ permissions }));
    const afterProposal = authorizeResearch(
      facts({
        permissions,
        activePolicy: { ...facts().activePolicy!, version: 3, withdrawalMode: 'require-all' },
      }),
    );
    expect(beforeProposal.allowed).toBe(true);
    expect(beforeProposal.eligibleContributionIds).toEqual(['response-a', 'response-c']);
    expect(afterProposal.allowed).toBe(false);
    expect(afterProposal.eligibleContributionIds).toEqual([]);
    expect(afterProposal.reasons).toContain(
      'community-policy-requires-all-contributors-to-have-active-permission',
    );
  });

  it('fails closed when a contributor purpose differs from the contribution purpose', () => {
    const permissions = facts().permissions.map((permission) =>
      permission.permissionId.startsWith('contributor-b:')
        ? { ...permission, purpose: 'community-access-research' }
        : permission,
    );
    const result = authorizeResearch(facts({ permissions }));
    expect(result.allowed).toBe(true);
    expect(result.eligibleContributionIds).toEqual(['response-a', 'response-c']);
    expect(result.excludedContributions[0]?.reason).toBe(
      'individual-purpose-does-not-match-contribution',
    );
  });

  it('checks the timestamp even when a record still says granted', () => {
    const permissions = facts().permissions.map((permission) =>
      permission.permissionId.startsWith('contributor-a:')
        ? { ...permission, expiresAt: '2026-11-16T11:59:59.000Z' }
        : permission,
    );
    const result = authorizeResearch(facts({ permissions }));
    expect(result.eligibleContributionIds).not.toContain('response-a');
    expect(result.excludedContributions[0]?.reason).toBe('individual-permission-expired');
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
      'community-policy-prohibits-commercial-use',
    );
    expect(authorizeResearch(facts({ jobType: 'arbitrary-script' })).reasons).toContain(
      'job-type-not-allowlisted',
    );
  });
});

describe('AI execution boundary', () => {
  it('sends only currently eligible contribution text to the selected model', async () => {
    const run = vi.fn(async (_model: string, _input: Record<string, unknown>) => ({
      themes: ['fictional theme'],
    }));
    const permissions = facts().permissions.map((permission) =>
      permission.permissionId.startsWith('contributor-b:')
        ? { ...permission, status: 'withdrawn' as const, version: 2 }
        : permission,
    );
    const result = await executeResearch(facts({ permissions }), {
      run,
    } as unknown as AIInferenceBinding);
    expect(result.status).toBe('completed');
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(
      DEMO_MODEL_ID,
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('response-a:'),
          }),
        ]),
        max_completion_tokens: 180,
        chat_template_kwargs: { enable_thinking: false },
      }),
    );
    const sentText = String(
      (run.mock.calls[0]?.[1] as { messages: { content: string }[] }).messages[1]?.content,
    );
    expect(sentText).toContain('response-c:');
    expect(sentText).not.toContain('response-b:');
    expect(result).toMatchObject({
      status: 'completed',
      inputContributionIds: ['response-a', 'response-c'],
    });
    expect(JSON.stringify(run.mock.calls[0])).not.toContain('patient');
    expect(SYNTHETIC_CORPUS).toContain('response-a:');
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

  it('requires an explicit fictional contributor when changing an individual permission', () => {
    expect(
      PermissionActionSchema.safeParse({ contributorId: 'contributor-b', action: 'withdraw' })
        .success,
    ).toBe(true);
    expect(
      PermissionActionSchema.safeParse({ contributorId: 'unknown', action: 'withdraw' }).success,
    ).toBe(false);
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

  it('accepts only fixed benefit-accountability actions and fictional evidence', () => {
    expect(BenefitActionSchema.safeParse({ action: 'agree' }).success).toBe(true);
    expect(BenefitActionSchema.safeParse({ action: 'accept' }).success).toBe(true);
    expect(
      BenefitActionSchema.safeParse({
        action: 'submit-evidence',
        evidence: 'accessible-summary-prepared',
      }).success,
    ).toBe(true);
    expect(
      BenefitActionSchema.safeParse({ action: 'review', outcome: 'changes-requested' }).success,
    ).toBe(true);
    expect(
      BenefitActionSchema.safeParse({
        action: 'submit-evidence',
        evidence: 'participant Alice said ...',
      }).success,
    ).toBe(false);
  });
});
