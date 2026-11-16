import { PermissionActionSchema } from '../../packages/contracts/src';
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
  const state = parsed.data.action === 'withdraw' ? 'withdrawn' : 'granted';
  await context.env.DB.prepare(
    `UPDATE individual_permissions SET status = ?1, version = version + 1, updated_at = ?2
     WHERE session_id = ?3 AND permission_id = 'participant-a'`,
  )
    .bind(state, now(), session.sessionId)
    .run();
  const correlationId = createCorrelationId();
  await audit(
    context.env.DB,
    session.sessionId,
    'demo:community_member',
    `individual-permission-${state}`,
    state,
    null,
    null,
    correlationId,
  );
  return json({ status: state, correlationId });
}
