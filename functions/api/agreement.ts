import {
  DEMO_PURPOSE,
  communityAgreementFromFacts,
  SYNTHETIC_CONTRIBUTIONS,
} from '../../packages/governance/src/authorization';
import { json, requireSession } from '../lib/http';
import type { Context } from '../types';
import { readRequiredBenefitIds } from '../lib/benefit-prerequisites';

type PolicyRow = {
  version: number;
  status: 'active' | 'superseded';
  allowed_purpose: string;
  commercial_allowed: number;
  withdrawal_mode: 'exclude-withdrawn' | 'require-all';
  effective_at: string;
  required_benefit_ids_json: string;
};
type PermissionRow = {
  permission_id: string;
  purpose: string;
  status: 'granted' | 'withdrawn' | 'expired';
  expires_at: string;
  version: number;
};
type BenefitRow = {
  title: string;
  owner: string;
  due_at: string;
  evidence: string | null;
  status: string;
  agreed_at: string | null;
  agreed_by: string | null;
  accepted_at: string | null;
  accepted_by: string | null;
  review_outcome: 'accepted' | 'changes-requested' | null;
  reviewed_by: string | null;
};

export async function onRequestGet(context: Context): Promise<Response> {
  const session = await requireSession(context);
  if (session instanceof Response) return session;

  const [policy, permissions, benefit] = await Promise.all([
    context.env.DB.prepare(
      "SELECT version, status, allowed_purpose, commercial_allowed, withdrawal_mode, effective_at, required_benefit_ids_json FROM policies WHERE session_id = ?1 AND status = 'active' ORDER BY version DESC LIMIT 1",
    )
      .bind(session.sessionId)
      .first<PolicyRow>(),
    context.env.DB.prepare(
      'SELECT permission_id, purpose, status, expires_at, version FROM individual_permissions WHERE session_id = ?1',
    )
      .bind(session.sessionId)
      .all<PermissionRow>(),
    context.env.DB.prepare(
      'SELECT title, owner, due_at, evidence, status, agreed_at, agreed_by, accepted_at, accepted_by, review_outcome, reviewed_by FROM benefit_commitments WHERE session_id = ?1 AND commitment_id = ?2',
    )
      .bind(session.sessionId, 'benefit-findings')
      .first<BenefitRow>(),
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
          requiredBenefitObligationIds: readRequiredBenefitIds(policy.required_benefit_ids_json),
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
    benefitObligations: benefit
      ? [
          {
            obligationId: 'benefit-findings',
            description: benefit.title,
            accountableParty: benefit.owner,
            dueAt: benefit.due_at,
            status: benefit.reviewed_by
              ? 'community-reviewed'
              : benefit.evidence
                ? 'evidence-recorded'
                : benefit.accepted_at
                  ? 'accepted'
                  : benefit.agreed_at
                    ? 'agreed'
                    : 'proposed',
            agreedByCommunity: Boolean(benefit.agreed_at),
            agreedBy: benefit.agreed_by,
            acceptedByResearchTeam: Boolean(benefit.accepted_at),
            acceptedBy: benefit.accepted_by,
            evidence: benefit.evidence,
            reviewOutcome: benefit.review_outcome,
            reviewedBy: benefit.reviewed_by,
          },
        ]
      : [],
    purpose: DEMO_PURPOSE,
    jobType: 'theme-classification',
    now: new Date(),
  });

  return json(agreement, 200, new Headers({ 'Cache-Control': 'no-store' }));
}
