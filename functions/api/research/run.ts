import { ResearchRequestSchema } from '../../../packages/contracts/src';
import {
  authorizeResearch,
  DEMO_DATASET_ID,
  DEMO_MODEL_ID,
  executeResearch,
  type AuthorizationFacts,
  type ResearchPurpose,
  permissionIdFor,
  SYNTHETIC_CONTRIBUTIONS,
} from '../../../packages/governance/src/authorization';
import type { Context } from '../../types';
import { inferenceFor } from '../../lib/inference';
import {
  audit,
  createCorrelationId,
  json,
  now,
  readJson,
  requireSession,
  sameOriginMutation,
} from '../../lib/http';

type PolicyRow = {
  version: number;
  status: 'active' | 'superseded';
  allowed_purpose: string;
  commercial_allowed: number;
  withdrawal_mode: 'exclude-withdrawn' | 'require-all';
  effective_at: string;
};
function contributionDecisionEvidence(decision: {
  eligibleContributionIds: string[];
  excludedContributions: { contributionId: string; contributorId: string; reason: string }[];
}): string {
  return JSON.stringify({
    processedContributionIds: decision.eligibleContributionIds,
    excludedContributions: decision.excludedContributions,
  });
}

type PersistedPermission = {
  permission_id: string;
  purpose: string;
  status: 'granted' | 'withdrawn' | 'expired';
  expires_at: string;
  version: number;
};

function clippedJson(value: unknown): string {
  const serialized = JSON.stringify(value);
  return serialized.length > 3000
    ? JSON.stringify({ error: 'model_output_truncated' })
    : serialized;
}

export async function onRequestPost(context: Context): Promise<Response> {
  if (!sameOriginMutation(context.request)) return json({ error: 'same_origin_required' }, 403);
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  const body = await readJson(context.request, 512);
  if (!body.ok) return json({ error: body.reason }, body.reason === 'body_too_large' ? 413 : 400);
  const parsed = ResearchRequestSchema.safeParse(body.value);
  if (!parsed.success)
    return json(
      {
        error: 'unsupported_research_request',
        details: parsed.error.issues.map((issue) => issue.message),
      },
      400,
    );

  const [policy, permissionRows] = await Promise.all([
    context.env.DB.prepare(
      "SELECT version, status, allowed_purpose, commercial_allowed, withdrawal_mode, effective_at FROM policies WHERE session_id = ?1 AND status = 'active' ORDER BY version DESC LIMIT 1",
    )
      .bind(session.sessionId)
      .first<PolicyRow>(),
    context.env.DB.prepare(
      'SELECT permission_id, purpose, status, expires_at, version FROM individual_permissions WHERE session_id = ?1',
    )
      .bind(session.sessionId)
      .all<PersistedPermission>(),
  ]);
  const runId = crypto.randomUUID();
  const correlationId = createCorrelationId();
  const purpose = parsed.data.purpose as ResearchPurpose;
  const facts: AuthorizationFacts = {
    actorRole: session.role as AuthorizationFacts['actorRole'],
    communityId: 'demo-community',
    activePolicy: policy
      ? {
          version: policy.version,
          status: policy.status,
          allowedPurpose: policy.allowed_purpose,
          commercialAllowed: Boolean(policy.commercial_allowed),
          withdrawalMode: policy.withdrawal_mode,
          effectiveAt: policy.effective_at,
        }
      : null,
    contributions: SYNTHETIC_CONTRIBUTIONS,
    permissions: permissionRows.results.map((permission) => ({
      permissionId: permission.permission_id,
      purpose: permission.purpose,
      status: permission.status,
      expiresAt: permission.expires_at,
      version: permission.version,
    })),
    purpose,
    jobType: parsed.data.jobType,
    now: new Date(),
  };
  const startedAt = now();

  const perSessionCount = await context.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM research_runs WHERE session_id = ?1 AND created_at >= ?2 AND status IN ('running', 'completed')",
  )
    .bind(session.sessionId, new Date(Date.now() - 86400000).toISOString())
    .first<{ count: number }>();
  if (session.role === 'researcher' && (perSessionCount?.count ?? 0) >= 3) {
    return json(
      {
        error: 'session_ai_limit',
        message: 'This synthetic session is limited to three model runs per day.',
      },
      429,
    );
  }

  // Insert a provisional record. The deterministic check still runs before the inference binding.
  await context.env.DB.prepare(
    `INSERT INTO research_runs(run_id, session_id, purpose, job_type, status, policy_version, decision_reasons, model_id, created_at)
     VALUES (?1, ?2, ?3, ?4, 'running', ?5, '[]', NULL, ?6)`,
  )
    .bind(
      runId,
      session.sessionId,
      purpose,
      parsed.data.jobType,
      facts.activePolicy?.version ?? null,
      startedAt,
    )
    .run();

  const decision = authorizeResearch(facts);
  if (!decision.allowed) {
    await context.env.DB.prepare(
      "UPDATE research_runs SET status = 'denied', decision_reasons = ?1, contribution_decisions_json = ?2, completed_at = ?3 WHERE session_id = ?4 AND run_id = ?5",
    )
      .bind(
        JSON.stringify(decision.reasons),
        contributionDecisionEvidence(decision),
        now(),
        session.sessionId,
        runId,
      )
      .run();
    await audit(
      context.env.DB,
      session.sessionId,
      `demo:${session.role}`,
      'research-authorization-denied',
      'denied',
      'denied',
      decision.policyVersion,
      correlationId,
    );
    return json(
      { runId, status: 'denied', decision, datasetId: DEMO_DATASET_ID, correlationId },
      403,
    );
  }

  const day = new Date().toISOString().slice(0, 10);
  const quota = await context.env.DB.prepare(
    `INSERT INTO demo_limits(day, run_count) VALUES (?1, 1)
     ON CONFLICT(day) DO UPDATE SET run_count = run_count + 1 WHERE demo_limits.run_count < 100
     RETURNING run_count`,
  )
    .bind(day)
    .first<{ run_count: number }>();
  if (!quota) {
    await context.env.DB.prepare(
      "UPDATE research_runs SET status = 'failed', decision_reasons = ?1, completed_at = ?2 WHERE session_id = ?3 AND run_id = ?4",
    )
      .bind(JSON.stringify(['daily-demo-ai-limit-reached']), now(), session.sessionId, runId)
      .run();
    await audit(
      context.env.DB,
      session.sessionId,
      `demo:${session.role}`,
      'research-daily-limit-reached',
      'not-executed',
      'failed',
      facts.activePolicy?.version ?? null,
      correlationId,
    );
    return json(
      {
        error: 'daily_demo_ai_limit',
        message: 'The public demonstration has reached its daily model-call limit.',
      },
      429,
    );
  }

  let inferenceMode: 'live' | 'mock';
  let execution;
  try {
    const inference = inferenceFor(context.env);
    inferenceMode = inference.mode;
    execution = await executeResearch(facts, inference.binding);
  } catch {
    const message =
      'The configured model could not complete this synthetic research job. No result was produced.';
    await context.env.DB.prepare(
      "UPDATE research_runs SET status = 'failed', decision_reasons = ?1, completed_at = ?2 WHERE session_id = ?3 AND run_id = ?4",
    )
      .bind(JSON.stringify(['model-inference-failed']), now(), session.sessionId, runId)
      .run();
    await audit(
      context.env.DB,
      session.sessionId,
      `demo:${session.role}`,
      'research-inference-failed',
      'authorized-but-inference-failed',
      'failed',
      facts.activePolicy?.version ?? null,
      correlationId,
    );
    return json({ runId, status: 'failed', error: message, correlationId }, 503);
  }

  if (execution.status !== 'completed') return json({ error: 'authorization_state_changed' }, 409);

  const completedAt = now();
  const eligible = new Set(execution.inputContributionIds);
  const usedContributions = SYNTHETIC_CONTRIBUTIONS.filter((item) =>
    eligible.has(item.contributionId),
  );
  const usedPermissions = usedContributions.map((item) => {
    const permissionId = permissionIdFor(item.contributorId, item.purpose);
    return facts.permissions.find((permission) => permission.permissionId === permissionId);
  });
  if (usedPermissions.some((permission) => !permission)) {
    return json({ error: 'authorization_snapshot_unavailable' }, 503);
  }

  // This conditional UPDATE is the result-release boundary: it persists output only if
  // the same researcher, policy version, and every used permission remain effective.
  const guardBindings: (string | number)[] = [
    session.sessionId,
    facts.activePolicy!.version,
    facts.activePolicy!.withdrawalMode,
    facts.activePolicy!.allowedPurpose,
    facts.activePolicy!.commercialAllowed ? 1 : 0,
    session.sessionId,
    completedAt,
  ];
  let guardSql = `
    AND EXISTS (
      SELECT 1 FROM policies p WHERE p.session_id = ?9 AND p.status = 'active'
        AND p.version = ?10 AND p.withdrawal_mode = ?11
        AND p.allowed_purpose = ?12 AND p.commercial_allowed = ?13
    )
    AND EXISTS (
      SELECT 1 FROM sessions s WHERE s.session_id = ?14
        AND s.actor_role = 'researcher' AND s.expires_at > ?15
    )`;
  let nextBinding = 16;
  for (let index = 0; index < usedContributions.length; index += 1) {
    const contribution = usedContributions[index];
    const permission = usedPermissions[index]!;
    const start = nextBinding;
    guardSql += `
      AND EXISTS (
        SELECT 1 FROM individual_permissions ip WHERE ip.session_id = ?${start}
          AND ip.permission_id = ?${start + 1} AND ip.version = ?${start + 2}
          AND ip.purpose = ?${start + 3} AND ip.status = 'granted'
          AND ip.expires_at = ?${start + 4} AND ip.expires_at > ?${start + 5}
      )`;
    guardBindings.push(
      session.sessionId,
      permission.permissionId,
      permission.version,
      contribution.purpose,
      permission.expiresAt,
      completedAt,
    );
    nextBinding += 6;
  }

  const released = await context.env.DB.prepare(
    `UPDATE research_runs SET status = 'completed', policy_version = ?1, decision_reasons = ?2,
       contribution_decisions_json = ?3, model_id = ?4, output_json = ?5, completed_at = ?6
     WHERE session_id = ?7 AND run_id = ?8 ${guardSql}`,
  )
    .bind(
      execution.decision.policyVersion,
      JSON.stringify(execution.decision.reasons),
      contributionDecisionEvidence(execution.decision),
      inferenceMode === 'live' ? DEMO_MODEL_ID : 'mock:deterministic-fixture',
      clippedJson(execution.output),
      completedAt,
      session.sessionId,
      runId,
      ...guardBindings,
    )
    .run();

  if (released.meta.changes !== 1) {
    const withheldReason = 'authorization-changed-before-output-release';
    await context.env.DB.prepare(
      `UPDATE research_runs SET status = 'failed', decision_reasons = ?1,
         contribution_decisions_json = ?2, model_id = ?3, output_json = NULL, completed_at = ?4
       WHERE session_id = ?5 AND run_id = ?6 AND status = 'running'`,
    )
      .bind(
        JSON.stringify([withheldReason]),
        contributionDecisionEvidence(execution.decision),
        inferenceMode === 'live' ? DEMO_MODEL_ID : 'mock:deterministic-fixture',
        completedAt,
        session.sessionId,
        runId,
      )
      .run();
    await audit(
      context.env.DB,
      session.sessionId,
      `demo:${session.role}`,
      'research-result-withheld',
      'withheld-after-authorization-change',
      'withheld',
      execution.decision.policyVersion,
      correlationId,
    ).catch(() => undefined);
    return json(
      {
        runId,
        status: 'withheld',
        error: 'authorization_changed_before_output_release',
        message:
          'A contributor permission or community policy changed while the model was running. Its result was withheld and was not released.',
        correlationId,
        synthetic: true,
      },
      409,
    );
  }
  await audit(
    context.env.DB,
    session.sessionId,
    `demo:${session.role}`,
    'research-inference-completed',
    'allowed',
    'completed',
    execution.decision.policyVersion,
    correlationId,
  );
  return json({
    runId,
    status: 'completed',
    decision: execution.decision,
    datasetId: DEMO_DATASET_ID,
    modelId: inferenceMode === 'live' ? DEMO_MODEL_ID : 'mock:deterministic-fixture',
    provider:
      inferenceMode === 'live' ? 'Cloudflare Workers AI' : 'Local deterministic test double',
    output: execution.output,
    inputContributionIds: execution.inputContributionIds,
    excludedContributions: execution.decision.excludedContributions,
    timing: { startedAt, completedAt },
    correlationId,
    synthetic: true,
    inferenceMode,
  });
}
