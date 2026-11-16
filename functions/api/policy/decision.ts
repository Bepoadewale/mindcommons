import { PolicyDecisionSchema } from '../../../packages/contracts/src';
import type { Context } from '../../types';
import {
  audit,
  createCorrelationId,
  json,
  now,
  readJson,
  requireSession,
  sameOriginMutation,
} from '../../lib/http';

export async function onRequestPost(context: Context): Promise<Response> {
  if (!sameOriginMutation(context.request)) return json({ error: 'same_origin_required' }, 403);
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  if (session.role !== 'community_representative')
    return json({ error: 'community_representative_required' }, 403);
  const body = await readJson(context.request, 256);
  if (!body.ok) return json({ error: body.reason }, body.reason === 'body_too_large' ? 413 : 400);
  const parsed = PolicyDecisionSchema.safeParse(body.value);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);

  const proposal = await context.env.DB.prepare(
    'SELECT status, proposed_purpose, proposed_commercial_allowed FROM proposals WHERE session_id = ?1 AND proposal_id = ?2',
  )
    .bind(session.sessionId, parsed.data.proposalId)
    .first<{ status: string; proposed_purpose: string; proposed_commercial_allowed: number }>();
  if (!proposal || proposal.status !== 'reviewed')
    return json({ error: 'proposal_not_reviewable' }, 409);

  const active = await context.env.DB.prepare(
    "SELECT version FROM policies WHERE session_id = ?1 AND status = 'active' ORDER BY version DESC LIMIT 1",
  )
    .bind(session.sessionId)
    .first<{ version: number }>();
  if (!active) return json({ error: 'effective_policy_unavailable' }, 503);
  const timestamp = now();
  const correlationId = createCorrelationId();
  if (parsed.data.decision === 'approve') {
    await context.env.DB.batch([
      context.env.DB.prepare(
        "UPDATE proposals SET status = 'approved', decided_at = ?1 WHERE session_id = ?2 AND proposal_id = ?3 AND status = 'reviewed'",
      ).bind(timestamp, session.sessionId, parsed.data.proposalId),
      context.env.DB.prepare(
        "UPDATE policies SET status = 'superseded' WHERE session_id = ?1 AND status = 'active'",
      ).bind(session.sessionId),
      context.env.DB.prepare(
        "INSERT INTO policies(session_id, version, status, allowed_purpose, commercial_allowed, effective_at) VALUES (?1, ?2, 'active', ?3, ?4, ?5)",
      ).bind(
        session.sessionId,
        active.version + 1,
        proposal.proposed_purpose,
        proposal.proposed_commercial_allowed,
        timestamp,
      ),
    ]);
  } else {
    await context.env.DB.prepare(
      "UPDATE proposals SET status = 'rejected', decided_at = ?1 WHERE session_id = ?2 AND proposal_id = ?3 AND status = 'reviewed'",
    )
      .bind(timestamp, session.sessionId, parsed.data.proposalId)
      .run();
  }
  const latest = await context.env.DB.prepare(
    "SELECT version FROM policies WHERE session_id = ?1 AND status = 'active'",
  )
    .bind(session.sessionId)
    .first<{ version: number }>();
  await audit(
    context.env.DB,
    session.sessionId,
    'demo:community_representative',
    `proposal-${parsed.data.decision}d`,
    parsed.data.decision,
    null,
    latest?.version ?? active.version,
    correlationId,
  );
  return json({
    proposalStatus: parsed.data.decision === 'approve' ? 'approved' : 'rejected',
    policyVersion: latest?.version ?? active.version,
    correlationId,
  });
}
