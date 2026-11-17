import { DecisionReceiptSchema } from '../../../packages/contracts/src';
import type { Context } from '../../types';
import { json, requireSession } from '../../lib/http';

export async function onRequestGet(context: Context): Promise<Response> {
  const session = await requireSession(context);
  if (session instanceof Response) return session;
  const url = new URL(context.request.url);
  const runIds = url.searchParams.getAll('runId');
  if (
    url.searchParams.size !== 1 ||
    runIds.length !== 1 ||
    !/^[0-9a-f-]{36}$/i.test(runIds[0] ?? '')
  ) {
    return json({ error: 'invalid_receipt_request' }, 400);
  }

  const row = await context.env.DB.prepare(
    'SELECT decision_receipt_json FROM research_runs WHERE session_id = ?1 AND run_id = ?2',
  )
    .bind(session.sessionId, runIds[0])
    .first<{ decision_receipt_json: string | null }>();
  if (!row?.decision_receipt_json) return json({ error: 'decision_receipt_not_found' }, 404);

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.decision_receipt_json);
  } catch {
    return json({ error: 'decision_receipt_unavailable' }, 503);
  }
  const receipt = DecisionReceiptSchema.safeParse(parsed);
  if (!receipt.success) return json({ error: 'decision_receipt_unavailable' }, 503);

  return json(
    receipt.data,
    200,
    new Headers({
      'Content-Disposition': 'attachment; filename="mindcommons-decision-receipt.json"',
    }),
  );
}
