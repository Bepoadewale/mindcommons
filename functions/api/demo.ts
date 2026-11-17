import type { Context } from '../types';
import {
  DEMO_PURPOSE,
  permissionIdFor,
  SYNTHETIC_CONTRIBUTIONS,
} from '../../packages/governance/src/authorization';
import {
  createCorrelationId,
  json,
  now,
  readSessionId,
  requireSession,
  setSessionCookie,
} from '../lib/http';

const expiry = (from = new Date()) => new Date(from.getTime() + 2 * 60 * 60 * 1000).toISOString();

async function createDemoSession(context: Context): Promise<string | null> {
  const timestamp = now();
  const day = timestamp.slice(0, 10);
  const quota = await context.env.DB.prepare(
    `INSERT INTO demo_session_limits(day, session_count) VALUES (?1, 1)
     ON CONFLICT(day) DO UPDATE SET session_count = session_count + 1
     WHERE demo_session_limits.session_count < 500 RETURNING session_count`,
  )
    .bind(day)
    .first<{ session_count: number }>();
  if (!quota) return null;

  const cleanupLock = await context.env.DB.prepare(
    `UPDATE cleanup_state SET last_cleaned_at = ?1
     WHERE id = 1 AND (last_cleaned_at IS NULL OR last_cleaned_at < ?2)
     RETURNING id`,
  )
    .bind(timestamp, new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .first<{ id: number }>();
  if (cleanupLock) {
    await context.env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?1')
      .bind(timestamp)
      .run();
  }

  const sessionId = crypto.randomUUID();
  const correlationId = createCorrelationId();
  const permissionExpiry = expiry();
  const benefitDueAt = new Date(Date.now() + 30 * 86400000).toISOString();
  const statements = [
    context.env.DB.prepare(
      'INSERT INTO sessions(session_id, actor_role, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)',
    ).bind(sessionId, 'community_representative', timestamp, expiry()),
    context.env.DB.prepare(
      `INSERT INTO policies(session_id, version, status, allowed_purpose, commercial_allowed, effective_at, withdrawal_mode)
       VALUES (?1, 1, 'active', ?2, 0, ?3, 'exclude-withdrawn')`,
    ).bind(sessionId, DEMO_PURPOSE, timestamp),
    context.env.DB.prepare(
      `INSERT INTO proposals(proposal_id, session_id, status, title, proposed_purpose, proposed_commercial_allowed, created_at, withdrawal_mode)
       VALUES ('proposal-v2', ?1, 'reviewed', 'Require every contributor to permit the research request', ?2, 0, ?3, 'require-all')`,
    ).bind(sessionId, DEMO_PURPOSE, timestamp),
    context.env.DB.prepare(
      `INSERT INTO benefit_commitments(commitment_id, session_id, title, owner, due_at, evidence, status)
       VALUES ('benefit-findings', ?1, 'Share an accessible summary of findings', 'Fictional research team', ?2, NULL, 'proposed')`,
    ).bind(sessionId, benefitDueAt),
    context.env.DB.prepare(
      `INSERT INTO audit_events(event_id, session_id, actor, community_id, action, policy_version, decision, job_status, correlation_id, occurred_at)
       VALUES (?1, ?2, 'demo-service', 'demo-community', 'synthetic-session-created', 1, 'initialized', NULL, ?3, ?4)`,
    ).bind(crypto.randomUUID(), sessionId, correlationId, timestamp),
  ];
  for (const contribution of SYNTHETIC_CONTRIBUTIONS) {
    const permissionId = permissionIdFor(contribution.contributorId, contribution.purpose);
    statements.push(
      context.env.DB.prepare(
        `INSERT INTO individual_permissions(permission_id, session_id, community_id, purpose, status, expires_at, version, updated_at)
         VALUES (?1, ?2, 'demo-community', ?3, 'granted', ?4, 1, ?5)`,
      ).bind(permissionId, sessionId, contribution.purpose, permissionExpiry, timestamp),
      context.env.DB.prepare(
        `INSERT INTO individual_permission_history(
           session_id, permission_id, version, community_id, purpose, status, expires_at,
           action, actor, correlation_id, recorded_at
         ) VALUES (?1, ?2, 1, 'demo-community', ?3, 'granted', ?4,
           'created', 'demo-service', ?5, ?6)`,
      ).bind(
        sessionId,
        permissionId,
        contribution.purpose,
        permissionExpiry,
        correlationId,
        timestamp,
      ),
    );
  }
  await context.env.DB.batch(statements);
  return sessionId;
}

export async function onRequestGet(context: Context): Promise<Response> {
  let sessionId = readSessionId(context.request);
  let created = false;
  if (sessionId) {
    const existing = await context.env.DB.prepare(
      'SELECT session_id FROM sessions WHERE session_id = ?1 AND expires_at > ?2',
    )
      .bind(sessionId, now())
      .first<{ session_id: string }>();
    if (!existing) {
      await context.env.DB.prepare('DELETE FROM sessions WHERE session_id = ?1')
        .bind(sessionId)
        .run();
      sessionId = null;
    }
  }
  if (!sessionId) {
    sessionId = await createDemoSession(context);
    if (!sessionId)
      return json(
        {
          error: 'daily_demo_session_limit',
          message: 'The public demonstration has reached its daily new-session limit.',
        },
        429,
      );
    created = true;
  }

  if (!created) {
    const session = await requireSession(context);
    if (session instanceof Response) return session;
  }
  const values = await Promise.all([
    context.env.DB.prepare('SELECT actor_role, expires_at FROM sessions WHERE session_id = ?1')
      .bind(sessionId)
      .first<{ actor_role: string; expires_at: string }>(),
    context.env.DB.prepare(
      "SELECT version, status, allowed_purpose, commercial_allowed, withdrawal_mode FROM policies WHERE session_id = ?1 AND status = 'active' ORDER BY version DESC LIMIT 1",
    )
      .bind(sessionId)
      .first<{
        version: number;
        status: string;
        allowed_purpose: string;
        commercial_allowed: number;
        withdrawal_mode: 'exclude-withdrawn' | 'require-all';
      }>(),
    context.env.DB.prepare(
      'SELECT proposal_id, status, title, proposed_purpose, proposed_commercial_allowed, withdrawal_mode FROM proposals WHERE session_id = ?1 ORDER BY created_at DESC LIMIT 1',
    )
      .bind(sessionId)
      .first<{
        proposal_id: string;
        status: string;
        title: string;
        proposed_purpose: string;
        proposed_commercial_allowed: number;
        withdrawal_mode: 'exclude-withdrawn' | 'require-all';
      }>(),
    context.env.DB.prepare(
      'SELECT permission_id, purpose, status, expires_at, version FROM individual_permissions WHERE session_id = ?1 ORDER BY permission_id',
    )
      .bind(sessionId)
      .all(),
    context.env.DB.prepare(
      `SELECT permission_id, version, purpose, status, expires_at, action, actor, correlation_id, recorded_at
       FROM individual_permission_history
       WHERE session_id = ?1 ORDER BY permission_id, version DESC LIMIT 150`,
    )
      .bind(sessionId)
      .all(),
    context.env.DB.prepare(
      'SELECT title, owner, due_at, evidence, status FROM benefit_commitments WHERE session_id = ?1',
    )
      .bind(sessionId)
      .first<{
        title: string;
        owner: string;
        due_at: string;
        evidence: string | null;
        status: string;
      }>(),
    context.env.DB.prepare(
      'SELECT event_id, actor, action, policy_version, decision, job_status, correlation_id, occurred_at FROM audit_events WHERE session_id = ?1 ORDER BY occurred_at DESC LIMIT 12',
    )
      .bind(sessionId)
      .all(),
    context.env.DB.prepare(
      'SELECT run_id, purpose, job_type, status, policy_version, decision_reasons, contribution_decisions_json, model_id, output_json, created_at, completed_at FROM research_runs WHERE session_id = ?1 ORDER BY created_at DESC LIMIT 10',
    )
      .bind(sessionId)
      .all(),
  ]);
  const [actor, policy, proposal, permissions, permissionHistory, benefit, events, runs] = values;
  if (!actor || !policy || !proposal || !permissions || !permissionHistory || !benefit)
    return Response.json({ error: 'demo_state_unavailable' }, { status: 503 });

  const response = json({
    community: {
      id: 'demo-community',
      name: 'Riverbend Community (fictional)',
      location: 'Nigeria (scenario only)',
    },
    synthetic: true,
    demoRole: actor.actor_role,
    availableRoles: ['community_representative', 'researcher', 'community_member'],
    expiresAt: actor.expires_at,
    policy: {
      ...policy,
      commercialAllowed: Boolean(policy.commercial_allowed),
      withdrawalMode: policy.withdrawal_mode,
    },
    proposal: proposal && {
      ...proposal,
      proposedCommercialAllowed: Boolean(proposal.proposed_commercial_allowed),
      withdrawalMode: proposal.withdrawal_mode,
    },
    contributions: SYNTHETIC_CONTRIBUTIONS.map(({ contributionId, contributorId, purpose }) => ({
      contributionId,
      contributorId,
      purpose,
    })),
    permissions: permissions.results,
    permissionHistory: permissionHistory.results,
    benefit,
    events: events.results,
    runs: runs.results.map((run) => ({
      ...run,
      reasons: JSON.parse(String(run.decision_reasons)),
      contributionDecisions: JSON.parse(String(run.contribution_decisions_json)),
      output: run.output_json ? JSON.parse(String(run.output_json)) : null,
    })),
  });
  return created ? setSessionCookie(response, context.request, sessionId) : response;
}

export async function onRequestDelete(context: Context): Promise<Response> {
  if (context.request.headers.get('Origin') !== new URL(context.request.url).origin) {
    return json({ error: 'same_origin_required' }, 403);
  }
  const sessionId = readSessionId(context.request);
  const newSessionId = await createDemoSession(context);
  if (!newSessionId)
    return json(
      {
        error: 'daily_demo_session_limit',
        message: 'The public demonstration has reached its daily new-session limit.',
      },
      429,
    );
  if (sessionId)
    await context.env.DB.prepare('DELETE FROM sessions WHERE session_id = ?1')
      .bind(sessionId)
      .run();
  const response = json({ reset: true, message: 'A fresh fictional session is ready.' });
  return setSessionCookie(response, context.request, newSessionId);
}
