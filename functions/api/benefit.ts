import { BenefitEvidenceSchema } from '../../packages/contracts/src';
import type { Context } from '../types';
import {
  audit,
  createCorrelationId,
  json,
  readJson,
  requireSession,
  sameOriginMutation,
} from '../lib/http';

const evidenceText = {
  'accessible-summary-prepared': 'Synthetic evidence: an accessible summary draft was prepared.',
  'community-review-scheduled': 'Synthetic evidence: a community review session was scheduled.',
};

export async function onRequestPost(context: Context): Promise<Response> {
  if (!sameOriginMutation(context.request)) return json({ error: 'same_origin_required' }, 403);
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  if (session.role !== 'community_representative')
    return json({ error: 'community_representative_required' }, 403);
  const body = await readJson(context.request, 256);
  if (!body.ok) return json({ error: body.reason }, body.reason === 'body_too_large' ? 413 : 400);
  const parsed = BenefitEvidenceSchema.safeParse(body.value);
  if (!parsed.success) return json({ error: 'unsupported_demo_evidence' }, 400);
  const evidence = parsed.data.evidence;
  await context.env.DB.prepare(
    `UPDATE benefit_commitments SET evidence = ?1, status = 'reviewed'
     WHERE session_id = ?2 AND commitment_id = 'benefit-findings'`,
  )
    .bind(evidenceText[evidence], session.sessionId)
    .run();
  const correlationId = createCorrelationId();
  await audit(
    context.env.DB,
    session.sessionId,
    'demo:community_representative',
    'benefit-evidence-recorded',
    'synthetic-evidence',
    'reviewed',
    null,
    correlationId,
  );
  return json({
    status: 'reviewed',
    evidence: evidenceText[evidence],
    synthetic: true,
    correlationId,
  });
}
