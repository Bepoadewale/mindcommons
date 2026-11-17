import type { Context } from '../types';

const SESSION_COOKIE = 'mindcommons_session';
const SESSION_SECONDS = 60 * 60 * 2;

export function json(data: unknown, status = 200, headers = new Headers()): Response {
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

export type JsonRead =
  { ok: true; value: unknown } | { ok: false; reason: 'body_too_large' | 'invalid_json' };

export async function readJson(request: Request, maxBytes = 1024): Promise<JsonRead> {
  const contentLength = request.headers.get('Content-Length');
  if (contentLength !== null) {
    const declared = Number(contentLength);
    if (!Number.isSafeInteger(declared) || declared < 0)
      return { ok: false, reason: 'invalid_json' };
    if (declared > maxBytes) return { ok: false, reason: 'body_too_large' };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, reason: 'invalid_json' };
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // A failing cancel must not change the body-size decision.
        }
        return { ok: false, reason: 'body_too_large' };
      }
      chunks.push(value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // The stream may already be errored or canceled.
    }
    return { ok: false, reason: 'invalid_json' };
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
}

export function readSessionId(request: Request): string | null {
  const cookies = request.headers.get('Cookie') ?? '';
  const prefix =
    new URL(request.url).protocol === 'https:' ? `__Host-${SESSION_COOKIE}` : SESSION_COOKIE;
  const found = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${prefix}=`));
  const value = found?.slice(prefix.length + 1);
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

export function setSessionCookie(
  response: Response,
  request: Request,
  sessionId: string,
): Response {
  const isSecure = new URL(request.url).protocol === 'https:';
  const cookieName = isSecure ? `__Host-${SESSION_COOKIE}` : SESSION_COOKIE;
  const secure = isSecure ? '; Secure' : '';
  response.headers.append(
    'Set-Cookie',
    `${cookieName}=${sessionId}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; SameSite=Lax${secure}`,
  );
  return response;
}

export function clearSessionCookie(response: Response): Response {
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  );
  return response;
}

export function sameOriginMutation(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return origin !== null && origin === new URL(request.url).origin;
}

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export async function requireSession(
  context: Context,
): Promise<{ sessionId: string; role: string } | Response> {
  const sessionId = readSessionId(context.request);
  if (!sessionId) return json({ error: 'demo_session_required' }, 401);
  const session = await context.env.DB.prepare(
    'SELECT actor_role, expires_at FROM sessions WHERE session_id = ?1',
  )
    .bind(sessionId)
    .first<{ actor_role: string; expires_at: string }>();
  if (!session || Date.parse(session.expires_at) <= Date.now()) {
    if (session)
      await context.env.DB.prepare('DELETE FROM sessions WHERE session_id = ?1')
        .bind(sessionId)
        .run();
    return json(
      { error: 'demo_session_expired', message: 'Reset the synthetic demo session to continue.' },
      401,
    );
  }

  const minute = new Date().toISOString().slice(0, 16);
  const rate = await context.env.DB.prepare(
    `INSERT INTO rate_limits(session_id, minute, request_count) VALUES (?1, ?2, 1)
     ON CONFLICT(session_id, minute) DO UPDATE SET request_count = request_count + 1
     RETURNING request_count`,
  )
    .bind(sessionId, minute)
    .first<{ request_count: number }>();
  if (!rate || rate.request_count > 60)
    return json({ error: 'demo_rate_limit', retryAfterSeconds: 60 }, 429);
  return { sessionId, role: session.actor_role };
}

export async function audit(
  db: D1Database,
  sessionId: string,
  actor: string,
  action: string,
  decision: string | null,
  jobStatus: string | null,
  policyVersion: number | null,
  correlationId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_events(event_id, session_id, actor, community_id, action, policy_version, decision, job_status, correlation_id, occurred_at)
     VALUES (?1, ?2, ?3, 'demo-community', ?4, ?5, ?6, ?7, ?8, ?9)`,
    )
    .bind(
      crypto.randomUUID(),
      sessionId,
      actor,
      action,
      policyVersion,
      decision,
      jobStatus,
      correlationId,
      now(),
    )
    .run();
}
