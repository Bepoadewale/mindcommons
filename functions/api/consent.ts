import { PermissionActionSchema } from '../../packages/contracts/src';
import {
  permissionIdFor,
  SYNTHETIC_CONTRIBUTIONS,
} from '../../packages/governance/src/authorization';
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

export async function onRequestPost(context: Context): Promise<Response> {
  if (!sameOriginMutation(context.request)) return json({ error: 'same_origin_required' }, 403);
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  if (session.role !== 'community_member') return json({ error: 'community_member_required' }, 403);
  const body = await readJson(context.request, 256);
  if (!body.ok) return json({ error: body.reason }, body.reason === 'body_too_large' ? 413 : 400);
  const parsed = PermissionActionSchema.safeParse(body.value);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);
  const contribution = SYNTHETIC_CONTRIBUTIONS.find(
    (record) => record.contributorId === parsed.data.contributorId,
  );
  if (!contribution) return json({ error: 'unknown_contributor' }, 400);
  const permissionId = permissionIdFor(contribution.contributorId, contribution.purpose);
  const state = parsed.data.action === 'withdraw' ? 'withdrawn' : 'granted';
  const current = await context.env.DB.prepare(
    `SELECT version FROM individual_permissions
     WHERE session_id = ?1 AND permission_id = ?2`,
  )
    .bind(session.sessionId, permissionId)
    .first<{ version: number }>();
  if (!current) return json({ error: 'permission_record_unavailable' }, 503);
  if (current.version >= 50)
    return json(
      {
        error: 'permission_history_limit',
        message: 'This synthetic session reached its 50-version permission history limit.',
      },
      429,
    );

  const correlationId = createCorrelationId();
  const timestamp = now();
  const results = await context.env.DB.batch([
    context.env.DB.prepare(
      `UPDATE individual_permissions SET status = ?1, version = version + 1, updated_at = ?2
       WHERE session_id = ?3 AND permission_id = ?4 AND version = ?5`,
    ).bind(state, timestamp, session.sessionId, permissionId, current.version),
    context.env.DB.prepare(
      `INSERT INTO individual_permission_history(
         session_id, permission_id, version, community_id, purpose, status, expires_at,
         action, actor, correlation_id, recorded_at
       )
       SELECT session_id, permission_id, version, community_id, purpose, status, expires_at,
         ?1, ?2, ?3, ?4
       FROM individual_permissions
       WHERE session_id = ?5 AND permission_id = ?6 AND version = ?7 AND status = ?8
       ON CONFLICT(session_id, permission_id, version) DO NOTHING`,
    ).bind(
      state,
      `demo:${parsed.data.contributorId}`,
      correlationId,
      timestamp,
      session.sessionId,
      permissionId,
      current.version + 1,
      state,
    ),
  ]);
  if (results[0]?.meta.changes !== 1 || results[1]?.meta.changes !== 1)
    return json({ error: 'permission_update_conflict' }, 409);

  await audit(
    context.env.DB,
    session.sessionId,
    `demo:${parsed.data.contributorId}`,
    `individual-permission-${state}`,
    state,
    null,
    null,
    correlationId,
  );
  return json({
    contributorId: parsed.data.contributorId,
    status: state,
    version: current.version + 1,
    correlationId,
  });
}
