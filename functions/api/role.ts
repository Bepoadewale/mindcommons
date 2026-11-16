import { ChangeDemoRoleSchema } from '../../packages/contracts/src';
import type { DemoRole } from '../../packages/governance/src/authorization';
import type { Context } from '../types';
import {
  audit,
  createCorrelationId,
  json,
  readJson,
  requireSession,
  sameOriginMutation,
} from '../lib/http';

export async function onRequestPost(context: Context): Promise<Response> {
  if (!sameOriginMutation(context.request)) return json({ error: 'same_origin_required' }, 403);
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  const payload = await readJson(context.request, 256);
  if (!payload.ok)
    return json({ error: payload.reason }, payload.reason === 'body_too_large' ? 413 : 400);
  const parsed = ChangeDemoRoleSchema.safeParse(payload.value);
  if (!parsed.success)
    return json(
      { error: 'invalid_request', details: parsed.error.issues.map((issue) => issue.message) },
      400,
    );
  await context.env.DB.prepare('UPDATE sessions SET actor_role = ?1 WHERE session_id = ?2')
    .bind(parsed.data.role, session.sessionId)
    .run();
  const correlationId = createCorrelationId();
  await audit(
    context.env.DB,
    session.sessionId,
    `demo:${parsed.data.role satisfies DemoRole}`,
    'demo-role-selected',
    'scenario-seat-selected',
    null,
    null,
    correlationId,
  );
  return json({ role: parsed.data.role, synthetic: true, correlationId });
}
