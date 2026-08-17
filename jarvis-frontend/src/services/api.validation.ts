import {
  sendChatMessage,
  sendChatStream,
  streamChatMessage,
  parseSseEventBlock,
  getApiBaseUrl,
  DEFAULT_API_BASE_URL,
  ApiError,
} from './api';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[API Validation Failed]: ${message}`);
  }
}

/**
 * Self-contained validation routine for the Frontend API Client Layer.
 * Tests non-streaming requests, streaming responses, SSE buffering,
 * error handling, and URL resolution without external test runner dependencies.
 */
export async function runApiValidations(): Promise<boolean> {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Base URL test
    assert(getApiBaseUrl() === DEFAULT_API_BASE_URL, 'Default API base URL mismatch');

    // 2. SSE Parsing test
    assert(parseSseEventBlock('data: Hello') === 'Hello', 'Single line SSE fail');
    assert(parseSseEventBlock('data: Line1\ndata: Line2') === 'Line1\nLine2', 'Multi line SSE fail');
    assert(parseSseEventBlock(': keepalive') === null, 'Comment SSE fail');

    // 3. Mock fetch & test sendChatMessage
    let requestedUrl = '';
    let requestedBody = '';

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      requestedUrl = input.toString();
      requestedBody = init?.body as string;
      return new Response(JSON.stringify({ response: 'Systems nominal.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    const chatRes = await sendChatMessage({ message: 'Status' });
    assert(requestedUrl === 'http://localhost:8000/api/chat', 'URL mismatch in sendChatMessage');
    assert(JSON.parse(requestedBody).message === 'Status', 'Message payload mismatch');
    assert(chatRes.response === 'Systems nominal.', 'Response text mismatch');

    // 4. Mock fetch & test sendChatStream (SSE buffering across chunk boundaries)
    const encoder = new TextEncoder();
    const streamChunks = [
      encoder.encode('data: Hel'),
      encoder.encode('lo\n\ndata: '),
      encoder.encode('JARVIS\n\n'),
    ];

    let chunkIdx = 0;
    const readableStream = new ReadableStream({
      pull(controller) {
        if (chunkIdx < streamChunks.length) {
          controller.enqueue(streamChunks[chunkIdx++]);
        } else {
          controller.close();
        }
      },
    });

    globalThis.fetch = (async () => {
      return new Response(readableStream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }) as typeof fetch;

    const streamTokens: string[] = [];
    for await (const token of sendChatStream('Test stream')) {
      streamTokens.push(token);
    }

    assert(streamTokens.length === 2, `Expected 2 tokens, got ${streamTokens.length}`);
    assert(streamTokens[0] === 'Hello', `Expected 'Hello', got '${streamTokens[0]}'`);
    assert(streamTokens[1] === 'JARVIS', `Expected 'JARVIS', got '${streamTokens[1]}'`);

    // 5. Test streamChatMessage callback wrapper
    chunkIdx = 0;
    const readableStream2 = new ReadableStream({
      pull(controller) {
        if (chunkIdx < streamChunks.length) {
          controller.enqueue(streamChunks[chunkIdx++]);
        } else {
          controller.close();
        }
      },
    });

    globalThis.fetch = (async () => {
      return new Response(readableStream2, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }) as typeof fetch;

    const callbackTokens: string[] = [];
    const fullText = await streamChatMessage('Test callback', (t) => callbackTokens.push(t));
    assert(fullText === 'HelloJARVIS', 'Accumulated text mismatch');
    assert(callbackTokens.join('') === 'HelloJARVIS', 'Callback tokens mismatch');

    // 6. Test HTTP Error handling
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ detail: 'AI model overload' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    let caughtError: ApiError | null = null;
    try {
      await sendChatMessage('Test error');
    } catch (err) {
      if (err instanceof ApiError) {
        caughtError = err;
      }
    }
    assert(caughtError !== null, 'Should have caught ApiError');
    assert(caughtError?.status === 502, 'Status should be 502');
    assert(caughtError?.message === 'AI model overload', 'Error message mismatch');

    return true;
  } finally {
    globalThis.fetch = originalFetch;
  }
}
