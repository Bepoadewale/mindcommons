import {
  DEMO_PURPOSE,
  communityAgreementFromFacts,
  SYNTHETIC_CONTRIBUTIONS,
} from '../../packages/governance/src/authorization';
import { json, requireSession } from '../lib/http';
import type { Context } from '../types';

type PolicyRow = {
  version: number;
  status: 'active' | 'superseded';
  allowed_purpose: string;
  commercial_allowed: number;
  withdrawal_mode: 'exclude-withdrawn' | 'require-all';
  effective_at: string;
};
type PermissionRow = {
  permission_id: string;
  purpose: string;
  status: 'granted' | 'withdrawn' | 'expired';
  expires_at: string;
  version: number;
};

export async function onRequestGet(context: Context): Promise<Response> {
  const session = await requireSession(context);
  if (session instanceof Response) return session;

  const [policy, permissions] = await Promise.all([
    context.env.DB.prepare(
      "SELECT version, status, allowed_purpose, commercial_allowed, withdrawal_mode, effective_at FROM policies WHERE session_id = ?1 AND status = 'active' ORDER BY version DESC LIMIT 1",
    )
      .bind(session.sessionId)
      .first<PolicyRow>(),
    context.env.DB.prepare(
      'SELECT permission_id, purpose, status, expires_at, version FROM individual_permissions WHERE session_id = ?1',
    )
      .bind(session.sessionId)
      .all<PermissionRow>(),
  ]);

  const agreement = communityAgreementFromFacts({
    actorRole: session.role as 'community_representative' | 'researcher' | 'community_member',
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
    permissions: permissions.results.map((permission) => ({
      permissionId: permission.permission_id,
      purpose: permission.purpose,
      status: permission.status,
      expiresAt: permission.expires_at,
      version: permission.version,
    })),
    purpose: DEMO_PURPOSE,
    jobType: 'theme-classification',
    now: new Date(),
  });

  return json(agreement, 200, new Headers({ 'Cache-Control': 'no-store' }));
}
