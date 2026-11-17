import { BenefitActionSchema } from '../../packages/contracts/src';
import type { Context } from '../types';
import {
  audit,
  createCorrelationId,
  json,
  now,
  readJson,
  requireSession,
  sameOriginMutation,
} from '../lib/http';

const evidenceText = {
  'accessible-summary-prepared': 'Synthetic evidence: an accessible summary draft was prepared.',
  'community-review-scheduled': 'Synthetic evidence: a community review session was scheduled.',
} as const;

type CommitmentState = {
  status: string;
  agreed_at: string | null;
  accepted_at: string | null;
  evidence: string | null;
  review_outcome: 'accepted' | 'changes-requested' | null;
  reviewed_at: string | null;
};

export async function onRequestPost(context: Context): Promise<Response> {
  if (!sameOriginMutation(context.request)) return json({ error: 'same_origin_required' }, 403);
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  const body = await readJson(context.request, 256);
  if (!body.ok) return json({ error: body.reason }, body.reason === 'body_too_large' ? 413 : 400);
  const parsed = BenefitActionSchema.safeParse(body.value);
  if (!parsed.success) return json({ error: 'unsupported_benefit_action' }, 400);

  const current = await context.env.DB.prepare(
    'SELECT status, agreed_at, accepted_at, evidence, review_outcome, reviewed_at FROM benefit_commitments WHERE session_id = ?1 AND commitment_id = ?2',
  )
    .bind(session.sessionId, 'benefit-findings')
    .first<CommitmentState>();
  if (!current) return json({ error: 'benefit_commitment_not_found' }, 404);

  const action = parsed.data.action;
  const isRepresentative = session.role === 'community_representative';
  const isResearcher = session.role === 'researcher';
  let statement: D1PreparedStatement;
  let auditAction: string;
  let auditDecision: string;
  let nextStatus: string;
  const timestamp = now();

  if (action === 'agree') {
    if (!isRepresentative) return json({ error: 'community_representative_required' }, 403);
    if (current.status !== 'proposed' || current.agreed_at)
      return json({ error: 'benefit_commitment_not_agreeable' }, 409);
    statement = context.env.DB.prepare(
      `UPDATE benefit_commitments SET agreed_at = ?1, agreed_by = ?2
       WHERE session_id = ?3 AND commitment_id = 'benefit-findings'
         AND status = 'proposed' AND agreed_at IS NULL`,
    ).bind(timestamp, 'demo:community_representative', session.sessionId);
    auditAction = 'benefit-commitment-agreed';
    auditDecision = 'fictional-community-agreement';
    nextStatus = 'agreed';
  } else if (action === 'accept') {
    if (!isResearcher) return json({ error: 'researcher_required' }, 403);
    if (!current.agreed_at || current.accepted_at || current.status !== 'proposed')
      return json({ error: 'benefit_commitment_not_acceptance_ready' }, 409);
    statement = context.env.DB.prepare(
      `UPDATE benefit_commitments SET accepted_at = ?1, accepted_by = ?2, status = 'in_progress'
       WHERE session_id = ?3 AND commitment_id = 'benefit-findings'
         AND status = 'proposed' AND agreed_at IS NOT NULL AND accepted_at IS NULL`,
    ).bind(timestamp, 'demo:researcher', session.sessionId);
    auditAction = 'benefit-accepted-by-research-team';
    auditDecision = 'fictional-research-team-acceptance';
    nextStatus = 'in_progress';
  } else if (action === 'withdraw-acceptance') {
    if (!isResearcher) return json({ error: 'researcher_required' }, 403);
    if (!current.accepted_at || current.evidence || current.status !== 'in_progress')
      return json({ error: 'benefit_acceptance_not_withdrawable' }, 409);
    statement = context.env.DB.prepare(
      `UPDATE benefit_commitments SET accepted_at = NULL, accepted_by = NULL, status = 'proposed'
       WHERE session_id = ?1 AND commitment_id = 'benefit-findings'
         AND status = 'in_progress' AND accepted_at IS NOT NULL AND evidence IS NULL`,
    ).bind(session.sessionId);
    auditAction = 'benefit-acceptance-withdrawn';
    auditDecision = 'fictional-research-team-acceptance-withdrawn';
    nextStatus = 'agreed';
  } else if (action === 'submit-evidence') {
    if (!isResearcher) return json({ error: 'researcher_required' }, 403);
    if (!current.accepted_at || !['in_progress', 'reviewed'].includes(current.status))
      return json({ error: 'benefit_evidence_not_acceptance_ready' }, 409);
    if (current.evidence && current.review_outcome !== 'changes-requested')
      return json({ error: 'benefit_evidence_not_revision_ready' }, 409);
    const evidence = evidenceText[parsed.data.evidence];
    statement = context.env.DB.prepare(
      `UPDATE benefit_commitments SET evidence = ?1, status = 'in_progress',
         review_outcome = NULL, reviewed_at = NULL, reviewed_by = NULL
       WHERE session_id = ?2 AND commitment_id = 'benefit-findings'
         AND accepted_at IS NOT NULL
         AND (evidence IS NULL OR review_outcome = 'changes-requested')`,
    ).bind(evidence, session.sessionId);
    auditAction = 'benefit-evidence-submitted';
    auditDecision = 'fictional-evidence-recorded';
    nextStatus = 'in_progress';
  } else {
    if (!isRepresentative) return json({ error: 'community_representative_required' }, 403);
    if (!current.accepted_at || !current.evidence || current.reviewed_at)
      return json({ error: 'benefit_evidence_not_reviewable' }, 409);
    statement = context.env.DB.prepare(
      `UPDATE benefit_commitments SET review_outcome = ?1, reviewed_at = ?2,
         reviewed_by = ?3, status = 'reviewed'
       WHERE session_id = ?4 AND commitment_id = 'benefit-findings'
         AND accepted_at IS NOT NULL AND evidence IS NOT NULL AND reviewed_at IS NULL`,
    ).bind(parsed.data.outcome, timestamp, 'demo:community_representative', session.sessionId);
    auditAction = 'benefit-evidence-community-reviewed';
    auditDecision = `fictional-community-review-${parsed.data.outcome}`;
    nextStatus = 'reviewed';
  }

  const result = await statement.run();
  if (result.meta.changes !== 1) return json({ error: 'benefit_action_conflict' }, 409);
  const correlationId = createCorrelationId();
  await audit(
    context.env.DB,
    session.sessionId,
    `demo:${session.role}`,
    auditAction,
    auditDecision,
    nextStatus,
    null,
    correlationId,
  );
  return json({
    status: nextStatus,
    action,
    synthetic: true,
    evidence: action === 'submit-evidence' ? evidenceText[parsed.data.evidence] : undefined,
    reviewOutcome: action === 'review' ? parsed.data.outcome : undefined,
    correlationId,
  });
}
