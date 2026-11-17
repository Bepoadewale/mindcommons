import { onRequestPost as createBenefitEvidence } from './api/benefit';
import { onRequestGet as loadAgreement } from './api/agreement';
import { communityAIAgreementJsonSchema } from '../packages/community-ai-agreement/src';
import { onRequestPost as updateConsent } from './api/consent';
import { onRequestDelete as resetDemo, onRequestGet as loadDemo } from './api/demo';
import { onRequestPost as decidePolicy } from './api/policy/decision';
import { onRequestPost as runResearch } from './api/research/run';
import { onRequestGet as getResearchReceipt } from './api/research/receipt';
import { onRequestPost as selectRole } from './api/role';
import { json } from './lib/http';
import type { Context, Env } from './types';

type Handler = (context: Context) => Promise<Response>;

const routes: Record<string, Record<string, Handler>> = {
  '/api/agreement': { GET: loadAgreement },
  '/api/agreement/schema': {
    GET: async () => json(communityAIAgreementJsonSchema()),
  },
  '/api/benefit': { POST: createBenefitEvidence },
  '/api/consent': { POST: updateConsent },
  '/api/demo': { DELETE: resetDemo, GET: loadDemo },
  '/api/policy/decision': { POST: decidePolicy },
  '/api/research/run': { POST: runResearch },
  '/api/research/receipt': { GET: getResearchReceipt },
  '/api/role': { POST: selectRole },
};

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; worker-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

function protect(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const methods = routes[url.pathname];
    if (!methods) return protect(json({ error: 'not_found' }, 404));

    const handler = methods[request.method];
    if (!handler) {
      const response = json({ error: 'method_not_allowed' }, 405);
      response.headers.set('Allow', Object.keys(methods).sort().join(', '));
      return protect(response);
    }

    try {
      return protect(await handler({ request, env }));
    } catch {
      return protect(
        json({ error: 'internal_error', message: 'The request could not be completed.' }, 500),
      );
    }
  },
};
