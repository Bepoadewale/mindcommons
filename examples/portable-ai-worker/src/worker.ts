import exampleAgreement from '../agreement.json';
import {
  AgreementEvaluationRequestSchema,
  evaluateCommunityAIAgreement,
} from '../../../packages/community-ai-agreement/src';

interface Environment {
  AI: { run(model: string, input: Record<string, unknown>): Promise<unknown> };
  RESEARCHER_ID: string;
  RESEARCHER_TOKEN: string;
}

const syntheticRecords: Record<string, string> = {
  'synthetic-response-1': 'A fictional peer group helped someone find a wellbeing resource.',
  'synthetic-response-2': 'A fictional community session was easier to attend with local support.',
};

export function createAgreementAIWorker(
  agreementSource: unknown | (() => unknown | Promise<unknown>),
) {
  const readAgreement = async () =>
    typeof agreementSource === 'function' ? await agreementSource() : agreementSource;
  const serviceRequestSchema = AgreementEvaluationRequestSchema.omit({ researcherId: true });
  return {
    async fetch(request: Request, environment: Environment): Promise<Response> {
      const url = new URL(request.url);
      if (url.pathname !== '/run' || request.method !== 'POST') {
        return Response.json({ error: 'not_found' }, { status: 404 });
      }
      if (!environment.RESEARCHER_ID || !environment.RESEARCHER_TOKEN) {
        return Response.json(
          { error: 'researcher_authentication_not_configured' },
          { status: 503 },
        );
      }
      if (request.headers.get('Authorization') !== `Bearer ${environment.RESEARCHER_TOKEN}`) {
        return Response.json({ error: 'researcher_authentication_required' }, { status: 401 });
      }
      const declaredLength = request.headers.get('Content-Length');
      if (
        declaredLength !== null &&
        (!/^\d+$/.test(declaredLength) || Number(declaredLength) > 4096)
      ) {
        return Response.json({ error: 'request_too_large' }, { status: 413 });
      }

      let body: unknown;
      try {
        const reader = request.body?.getReader();
        if (!reader) return Response.json({ error: 'invalid_json' }, { status: 400 });
        const chunks: Uint8Array[] = [];
        let length = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.byteLength;
          if (length > 4096) {
            await reader.cancel();
            return Response.json({ error: 'request_too_large' }, { status: 413 });
          }
          chunks.push(value);
        }
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      } catch {
        return Response.json({ error: 'invalid_json' }, { status: 400 });
      }
      const parsed = serviceRequestSchema.safeParse(body);
      if (!parsed.success)
        return Response.json({ error: 'invalid_agreement_request' }, { status: 400 });

      const evaluationRequest = { ...parsed.data, researcherId: environment.RESEARCHER_ID };
      const agreement = await readAgreement();
      const evaluation = evaluateCommunityAIAgreement(agreement, evaluationRequest);
      if (!evaluation.allowed) {
        return Response.json({ status: 'denied', evaluation }, { status: 403 });
      }
      const records = evaluation.eligibleContributionIds.map((id) => syntheticRecords[id]);
      if (records.some((record) => !record)) {
        return Response.json({ error: 'agreement_data_reference_missing' }, { status: 409 });
      }

      try {
        const output = await environment.AI.run(parsed.data.modelId, {
          messages: [
            {
              role: 'system',
              content:
                'Summarize themes in these synthetic records. Do not diagnose or give health advice.',
            },
            { role: 'user', content: records.join('\n') },
          ],
          max_completion_tokens: 120,
        });
        const latestEvaluation = evaluateCommunityAIAgreement(
          await readAgreement(),
          evaluationRequest,
        );
        if (
          !latestEvaluation.allowed ||
          latestEvaluation.agreementId !== evaluation.agreementId ||
          latestEvaluation.policyVersion !== evaluation.policyVersion ||
          JSON.stringify(latestEvaluation.eligibleContributionIds) !==
            JSON.stringify(evaluation.eligibleContributionIds) ||
          JSON.stringify(latestEvaluation.permissionVersions) !==
            JSON.stringify(evaluation.permissionVersions)
        ) {
          return Response.json(
            {
              status: 'withheld',
              error: 'authorization_changed_before_output_release',
              resultReleased: false,
              decision: evaluation,
            },
            { status: 409 },
          );
        }
        return Response.json({
          status: 'completed',
          decision: evaluation,
          agreementId: evaluation.agreementId,
          policyVersion: evaluation.policyVersion,
          processedContributionIds: evaluation.eligibleContributionIds,
          excludedContributions: evaluation.excludedContributions,
          output,
        });
      } catch {
        return Response.json(
          { error: 'model_execution_failed', resultReleased: false },
          { status: 503 },
        );
      }
    },
  };
}

export default createAgreementAIWorker(exampleAgreement);
