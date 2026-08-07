import type { BuiltRequest } from "./request-builder";
import { isAbortError } from "./utils";

export type ExecutedResponse = {
  kind: "response";
  status: number;
  statusText: string;
  durationMs: number;
  headers: Array<[string, string]>;
  body: string;
  contentType: string | null;
};

export type ExecutionError = {
  kind: "error";
  message: string;
};

export async function executeRequest(
  request: BuiltRequest,
  signal: AbortSignal,
): Promise<ExecutedResponse | ExecutionError> {
  const startedAt = Date.now();

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal,
    });
    const body = formatBody(await response.text());

    return {
      kind: "response",
      status: response.status,
      statusText: response.statusText,
      durationMs: Math.max(0, Date.now() - startedAt),
      headers: Array.from(response.headers.entries()),
      body,
      contentType: response.headers.get("content-type"),
    };
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw error;
    }

    return {
      kind: "error",
      message: "Request failed. Check the browser console and CORS configuration.",
    };
  }
}

function formatBody(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}
