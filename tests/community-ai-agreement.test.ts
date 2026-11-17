import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import sampleAgreement from '../examples/portable-ai-worker/agreement.json';
import {
  AgreementEvaluationRequestSchema,
  CommunityAIAgreementSchema,
  communityAIAgreementJsonSchema,
  evaluateCommunityAIAgreement,
} from '../packages/community-ai-agreement/src';

const request = {
  researcherId: 'fictional-researcher-1',
  purpose: 'community-wellbeing-research',
  jobType: 'theme-classification',
  modelId: '@cf/google/gemma-4-26b-a4b-it',
  contributionIds: ['synthetic-response-1', 'synthetic-response-2'],
  operation: 'inference',
  outputAudience: 'community',
  clinicalUse: false,
} as const;
const now = new Date('2026-11-17T12:00:00.000Z');

describe('portable Community AI Agreement protocol', () => {
  it('publishes a machine-readable schema and validates the fictional agreement fixture', async () => {
    expect(CommunityAIAgreementSchema.safeParse(sampleAgreement).success).toBe(true);
    expect(AgreementEvaluationRequestSchema.safeParse(request).success).toBe(true);
    const checkedInSchema = JSON.parse(
      await readFile(
        new URL('../packages/community-ai-agreement/schema.json', import.meta.url),
        'utf8',
      ),
    );
    expect(checkedInSchema).toEqual(communityAIAgreementJsonSchema());
    expect(checkedInSchema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
  });

  it('allows only the agreement-listed, individually permitted synthetic contributions', () => {
    expect(evaluateCommunityAIAgreement(sampleAgreement, request, now)).toMatchObject({
      allowed: true,
      agreementId: 'fictional-community:policy:1',
      policyVersion: 1,
      eligibleContributionIds: ['synthetic-response-1', 'synthetic-response-2'],
      excludedContributions: [],
    });
  });

  it('excludes the withdrawn contributor when policy permits per-record filtering', () => {
    const agreement = structuredClone(sampleAgreement);
    agreement.contributions[1]!.permission.status = 'withdrawn';
    expect(evaluateCommunityAIAgreement(agreement, request, now)).toMatchObject({
      allowed: true,
      eligibleContributionIds: ['synthetic-response-1'],
      excludedContributions: [
        {
          contributionId: 'synthetic-response-2',
          contributorId: 'fictional-contributor-2',
          reason: 'individual-permission-not-active',
        },
      ],
    });
  });

  it('blocks all processing if the same withdrawal occurs under a require-all rule', () => {
    const agreement = structuredClone(sampleAgreement);
    agreement.withdrawalMode = 'require-all';
    agreement.contributions[1]!.permission.status = 'withdrawn';
    expect(evaluateCommunityAIAgreement(agreement, request, now)).toMatchObject({
      allowed: false,
      eligibleContributionIds: [],
      reasons: ['community-policy-requires-all-contributors-to-have-active-permission'],
    });
  });

  it('denies unknown researchers, models, purposes, training, public results and clinical use', () => {
    const deniedRequests = [
      { ...request, researcherId: 'unlisted-researcher' },
      { ...request, modelId: 'unlisted-model' },
      { ...request, purpose: 'commercial-advertising' },
      { ...request, operation: 'training' },
      { ...request, outputAudience: 'public' },
      { ...request, clinicalUse: true },
    ];
    for (const deniedRequest of deniedRequests) {
      expect(evaluateCommunityAIAgreement(sampleAgreement, deniedRequest, now).allowed).toBe(false);
    }
  });

  it('fails closed for malformed agreements, expired permissions, and unsupported jobs', () => {
    expect(
      evaluateCommunityAIAgreement({ ...sampleAgreement, policyVersion: -1 }, request, now),
    ).toMatchObject({ allowed: false, reasons: ['agreement-or-request-invalid'] });
    const expired = structuredClone(sampleAgreement);
    expired.contributions[0]!.permission.expiresAt = '2026-11-17T11:59:59.000Z';
    expect(
      evaluateCommunityAIAgreement(expired, request, now).excludedContributions[0]?.reason,
    ).toBe('individual-permission-expired');
    expect(
      evaluateCommunityAIAgreement(
        sampleAgreement,
        { ...request, jobType: 'arbitrary-script' },
        now,
      ).reasons,
    ).toContain('job-type-not-allowlisted-by-agreement');
  });
});
