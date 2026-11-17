import { describe, expect, it, vi } from 'vitest';
import { readJson } from '../functions/lib/http';

function streamedRequest(
  body: ReadableStream<Uint8Array>,
  headers: Record<string, string> = {},
): Request {
  return { body, headers: new Headers(headers) } as Request;
}

describe('bounded JSON request reader', () => {
  it('parses UTF-8 JSON and counts encoded bytes', async () => {
    const bytes = new TextEncoder().encode('{"label":"ọ̀rẹ́"}');
    const request = streamedRequest(
      new ReadableStream({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        },
      }),
    );

    expect(await readJson(request, bytes.byteLength)).toEqual({
      ok: true,
      value: { label: 'ọ̀rẹ́' },
    });
  });

  it('rejects an oversized declared body before reading the stream', async () => {
    const pull = vi.fn();
    const request = streamedRequest(
      new ReadableStream<Uint8Array>({ pull }, { highWaterMark: 0 }),
      { 'Content-Length': '9' },
    );

    expect(await readJson(request, 8)).toEqual({ ok: false, reason: 'body_too_large' });
    expect(pull).not.toHaveBeenCalled();
  });

  it('cancels a streamed body as soon as it exceeds the limit', async () => {
    const cancel = vi.fn();
    const request = streamedRequest(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"oversized":true}'));
        },
        cancel,
      }),
      { 'Content-Length': '1' },
    );

    expect(await readJson(request, 4)).toEqual({ ok: false, reason: 'body_too_large' });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('rejects malformed UTF-8 and invalid JSON', async () => {
    const invalidUtf8 = streamedRequest(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([0xc3, 0x28]));
          controller.close();
        },
      }),
    );
    const invalidJson = streamedRequest(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{no}'));
          controller.close();
        },
      }),
    );

    expect(await readJson(invalidUtf8)).toEqual({ ok: false, reason: 'invalid_json' });
    expect(await readJson(invalidJson)).toEqual({ ok: false, reason: 'invalid_json' });
  });
});
