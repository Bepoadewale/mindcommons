import { describe, expect, it, vi } from 'vitest';
import worker from '../functions/worker';
import type { Env } from '../functions/types';

const environment = {
  ASSETS: { fetch: vi.fn(async () => new Response('asset')) },
} as unknown as Env;

describe('Workers Static Assets API router', () => {
  it('serves static paths through the asset binding', async () => {
    const request = new Request('https://mindcommons.example/vision/');
    const response = await worker.fetch(request, environment);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('asset');
    expect(environment.ASSETS.fetch).toHaveBeenCalledWith(request);
  });

  it('returns a protected JSON 404 for unknown API paths', async () => {
    const response = await worker.fetch(
      new Request('https://mindcommons.example/api/unknown'),
      environment,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('returns an explicit Allow header for unsupported methods', async () => {
    const response = await worker.fetch(
      new Request('https://mindcommons.example/api/demo', { method: 'POST' }),
      environment,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('DELETE, GET');
    expect(await response.json()).toEqual({ error: 'method_not_allowed' });
  });
});
