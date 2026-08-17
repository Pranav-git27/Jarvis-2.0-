/**
 * JARVIS 2.0 Frontend API Client Layer
 *
 * Provides non-streaming and streaming communication abstractions for
 * interacting with the FastAPI backend endpoints (/api/chat & /api/chat/stream).
 *
 * Architectural Requirement:
 * - Frontend MUST NEVER communicate directly with Gemini or Google GenAI SDK.
 * - Frontend MUST NEVER contain GEMINI_API_KEY.
 * - Frontend communicates exclusively with the FastAPI backend.
 */

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export interface ApiClientOptions {
  baseUrl?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;

    // Restore prototype chain for custom Error subclass in TS/JS
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const DEFAULT_API_BASE_URL = 'http://localhost:8000';

/**
 * Returns the resolved API base URL from Vite environment or default fallback.
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Internal helper to format request target URL safely.
 */
function buildEndpointUrl(baseUrl: string, endpoint: string): string {
  const sanitizedBase = baseUrl.replace(/\/+$/, '');
  const sanitizedEndpoint = endpoint.replace(/^\/+/, '');
  return `${sanitizedBase}/${sanitizedEndpoint}`;
}

/**
 * Internal helper to parse an SSE event block into raw text data.
 */
export function parseSseEventBlock(block: string): string | null {
  const lines = block.split('\n');
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      dataLines.push(line.slice(6));
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5));
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return dataLines.join('\n');
}

/**
 * Sends a non-streaming chat request to POST /api/chat.
 *
 * @param request ChatRequest object ({ message }) or message string.
 * @param options Optional API client settings (baseUrl, signal).
 * @returns Promise resolving to ChatResponse ({ response }).
 */
export async function sendChatMessage(
  request: ChatRequest | string,
  options: ApiClientOptions = {}
): Promise<ChatResponse> {
  const messageStr = typeof request === 'string' ? request : request?.message;

  if (!messageStr || typeof messageStr !== 'string' || messageStr.trim().length === 0) {
    throw new ApiError('Message content cannot be empty.');
  }

  const baseUrl = options.baseUrl || getApiBaseUrl();
  const url = buildEndpointUrl(baseUrl, '/api/chat');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageStr.trim() }),
      signal: options.signal,
    });

    if (!response.ok) {
      let errorMessage = `Backend HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
      } catch {
        // Fallback to generic status error if JSON parsing fails
      }
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    if (!data || typeof data.response !== 'string') {
      throw new ApiError('Invalid response payload format received from backend server.');
    }

    return data as ChatResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown network error';
    throw new ApiError(`Failed to communicate with JARVIS backend: ${message}`);
  }
}

/**
 * Sends a streaming chat request to POST /api/chat/stream and yields text chunks.
 * Uses an AsyncGenerator to expose streamed SSE text tokens cleanly.
 * Correctly handles chunk buffering, split network reads, and SSE boundaries.
 *
 * @param request ChatRequest object ({ message }) or message string.
 * @param options Optional API client settings (baseUrl, signal).
 * @returns AsyncGenerator yielding token strings as they arrive.
 */
export async function* sendChatStream(
  request: ChatRequest | string,
  options: ApiClientOptions = {}
): AsyncGenerator<string, void, unknown> {
  const messageStr = typeof request === 'string' ? request : request?.message;

  if (!messageStr || typeof messageStr !== 'string' || messageStr.trim().length === 0) {
    throw new ApiError('Message content cannot be empty.');
  }

  const baseUrl = options.baseUrl || getApiBaseUrl();
  const url = buildEndpointUrl(baseUrl, '/api/chat/stream');

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageStr.trim() }),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown network error';
    throw new ApiError(`Failed to connect to JARVIS streaming endpoint: ${message}`);
  }

  if (!response.ok) {
    let errorMessage = `Backend HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
    } catch {
      // Fallback to default error
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (!response.body) {
    throw new ApiError('Streaming response body is unreadable or empty.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Normalize line endings (\r\n -> \n)
      buffer = buffer.replace(/\r\n/g, '\n');

      // SSE blocks are delimited by double newlines (\n\n)
      let eventEndIndex: number;
      while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
        const eventBlock = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);

        const chunkText = parseSseEventBlock(eventBlock);
        if (chunkText !== null) {
          yield chunkText;
        }
      }
    }

    // Flush remaining bytes from text decoder
    buffer += decoder.decode();
    buffer = buffer.replace(/\r\n/g, '\n');

    if (buffer.trim().length > 0) {
      const chunkText = parseSseEventBlock(buffer);
      if (chunkText !== null) {
        yield chunkText;
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Stream processing interrupted';
    throw new ApiError(`JARVIS stream processing error: ${message}`);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Callback-based streaming helper function for POST /api/chat/stream.
 *
 * @param request ChatRequest object ({ message }) or message string.
 * @param onChunk Callback function invoked with each text token.
 * @param options Optional API client settings (baseUrl, signal).
 * @returns Promise resolving to the accumulated full response string.
 */
export async function streamChatMessage(
  request: ChatRequest | string,
  onChunk: (chunk: string) => void,
  options: ApiClientOptions = {}
): Promise<string> {
  let accumulatedText = '';
  for await (const chunk of sendChatStream(request, options)) {
    accumulatedText += chunk;
    onChunk(chunk);
  }
  return accumulatedText;
}
