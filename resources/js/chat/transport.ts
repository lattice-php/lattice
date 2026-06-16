import { apiFetch, remoteFetch, type RemoteAccess } from "../core/api";
import type { ChatFrame, ChatTransportRequest } from "./types";

function parseFrame(line: string): ChatFrame | null {
  try {
    return JSON.parse(line) as ChatFrame;
  } catch {
    return null;
  }
}

export async function* ndjsonChatTransport({
  url,
  body,
  signal,
}: ChatTransportRequest): AsyncGenerator<ChatFrame> {
  const res = await apiFetch(url, {
    method: "POST",
    signal,
    headers: { Accept: "application/x-ndjson" },
    body: JSON.stringify(body),
    throwOnError: false,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat stream failed (${res.status})`);
  }

  yield* readNdjsonFrames(res.body);
}

export function createRemoteNdjsonChatTransport(remote: RemoteAccess) {
  return async function* remoteNdjsonChatTransport({
    url,
    body,
    signal,
  }: ChatTransportRequest): AsyncGenerator<ChatFrame> {
    const res = await remoteFetch(url, {
      remote,
      method: "POST",
      signal,
      headers: {
        Accept: "application/x-ndjson",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      throwOnError: false,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat stream failed (${res.status})`);
    }

    yield* readNdjsonFrames(res.body);
  };
}

async function* readNdjsonFrames(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatFrame> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim() === "") {
          continue;
        }

        const frame = parseFrame(line);
        if (frame) {
          yield frame;
        }
      }
    }

    buffer += decoder.decode();
    if (buffer.trim() !== "") {
      const frame = parseFrame(buffer);
      if (frame) {
        yield frame;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}
