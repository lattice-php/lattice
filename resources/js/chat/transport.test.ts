import { afterEach, describe, expect, it, vi } from "vitest";
import { ndjsonChatTransport } from "./transport";
import type { ChatFrame } from "./types";

function streamResponse(lines: string[]): Response {
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (const l of lines) {
        c.enqueue(enc.encode(l));
      }
      c.close();
    },
  });

  return { ok: true, status: 200, body } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ndjsonChatTransport", () => {
  it("yields text and part frames, handling split lines", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () =>
      streamResponse([
        '{"type":"text","value":"Hel',
        'lo"}\n',
        '{"type":"part","part":{"type":"tool-call","name":"search","args":{}}}\n',
        '{"type":"done"}\n',
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const frames: ChatFrame[] = [];
    for await (const f of ndjsonChatTransport({
      url: "/x",
      body: { message: "hi" },
      signal: new AbortController().signal,
    })) {
      frames.push(f);
    }

    expect(frames).toEqual([
      { type: "text", value: "Hello" },
      { type: "part", part: { type: "tool-call", name: "search", args: {} } },
      { type: "done" },
    ]);
  });

  it("flushes a final line without a trailing newline", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () =>
      streamResponse(['{"type":"text","value":"Hi"}\n', '{"type":"done"}']),
    );
    vi.stubGlobal("fetch", fetchMock);

    const frames: ChatFrame[] = [];
    for await (const f of ndjsonChatTransport({
      url: "/x",
      body: {},
      signal: new AbortController().signal,
    })) {
      frames.push(f);
    }

    expect(frames).toEqual([{ type: "text", value: "Hi" }, { type: "done" }]);
  });

  it("skips blank lines and drops malformed frames, including a malformed trailing line", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () =>
      streamResponse(["\n", '{"type":"text","value":"Hi"}\n', "not json\n", "also not json"]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const frames: ChatFrame[] = [];
    for await (const f of ndjsonChatTransport({
      url: "/x",
      body: {},
      signal: new AbortController().signal,
    })) {
      frames.push(f);
    }

    expect(frames).toEqual([{ type: "text", value: "Hi" }]);
  });

  it("throws on a non-ok response", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(
      async () => ({ ok: false, status: 500, body: null }) as unknown as Response,
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(async () => {
      for await (const _ of ndjsonChatTransport({
        url: "/x",
        body: {},
        signal: new AbortController().signal,
      })) {
        void _;
      }
    }).rejects.toThrow("Chat stream failed (500)");
  });
});
