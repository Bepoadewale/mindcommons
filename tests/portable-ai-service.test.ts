import { describe, expect, it, vi } from 'vitest';
import exampleAgreement from '../examples/portable-ai-worker/agreement.json';
import { createAgreementAIWorker } from '../examples/portable-ai-worker/src/worker';
import { AgreementEvaluationRequestSchema } from '../packages/community-ai-agreement/src';

const requestBody = {
  purpose: 'community-wellbeing-research',
  jobType: 'theme-classification',
  modelId: '@cf/google/gemma-4-26b-a4b-it',
  contributionIds: ['synthetic-response-1', 'synthetic-response-2'],
  operation: 'inference',
  outputAudience: 'community',
  clinicalUse: false,
};
const serviceEnvironment = (ai: {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
}) => ({
  AI: ai,
  RESEARCHER_ID: 'fictional-researcher-1',
  RESEARCHER_TOKEN: 'test-only-token',
});
const authenticatedHeaders = { Authorization: 'Bearer test-only-token' };

describe('independent agreement-controlled AI service', () => {
  it('uses the same agreement schema and blocks a purpose outside the agreement', async () => {
    expect(
      AgreementEvaluationRequestSchema.safeParse({
        ...requestBody,
        researcherId: 'fictional-researcher-1',
      }).success,
    ).toBe(true);
    const ai = { run: vi.fn(async () => ({ ok: true })) };
    const response = await createAgreementAIWorker(exampleAgreement).fetch(
      new Request('https://example.test/run', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify({ ...requestBody, purpose: 'commercial-advertising' }),
      }),
      serviceEnvironment(ai),
    );
    expect(response.status).toBe(403);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('passes only selected, authorized synthetic records to inference', async () => {
    const ai = {
      run: vi.fn(async (_model: string, _input: Record<string, unknown>) => ({
        themes: ['fictional access'],
      })),
    };
    const response = await createAgreementAIWorker(exampleAgreement).fetch(
      new Request('https://example.test/run', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify({ ...requestBody, contributionIds: ['synthetic-response-1'] }),
      }),
      serviceEnvironment(ai),
    );
    expect(response.status).toBe(200);
    expect(ai.run).toHaveBeenCalledOnce();
    const input = ai.run.mock.calls[0]?.[1];
    expect(JSON.stringify(input)).toContain('fictional peer group');
    expect(JSON.stringify(input)).not.toContain('fictional community session');
  });

  it('fails closed when the agreement withdraws one contributor under require-all', async () => {
    const strictAgreement = structuredClone(exampleAgreement);
    strictAgreement.withdrawalMode = 'require-all';
    strictAgreement.contributions[1]!.permission.status = 'withdrawn';
    const ai = { run: vi.fn(async () => ({ themes: [] })) };
    const response = await createAgreementAIWorker(strictAgreement).fetch(
      new Request('https://example.test/run', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(requestBody),
      }),
      serviceEnvironment(ai),
    );
    expect(response.status).toBe(403);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('withholds the model result when a permission version changes during inference', async () => {
    const changedAgreement = structuredClone(exampleAgreement);
    const readAgreement = vi
      .fn()
      .mockResolvedValueOnce(exampleAgreement)
      .mockImplementationOnce(async () => {
        changedAgreement.contributions[0]!.permission.version = 2;
        return changedAgreement;
      });
    const ai = { run: vi.fn(async () => ({ sensitive: 'fictional output' })) };
    const response = await createAgreementAIWorker(readAgreement).fetch(
      new Request('https://example.test/run', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(requestBody),
      }),
      serviceEnvironment(ai),
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      status: 'withheld',
      error: 'authorization_changed_before_output_release',
      resultReleased: false,
    });
  });

  it('does not treat a body-supplied researcher ID as authentication', async () => {
    const ai = {
      run: vi.fn(async (_model: string, _input: Record<string, unknown>) => ({ ok: true })),
    };
    const response = await createAgreementAIWorker(exampleAgreement).fetch(
      new Request('https://example.test/run', {
        method: 'POST',
        body: JSON.stringify({ ...requestBody, researcherId: 'fictional-researcher-1' }),
      }),
      serviceEnvironment(ai),
    );
    expect(response.status).toBe(401);
    expect(ai.run).not.toHaveBeenCalled();
  });
});
