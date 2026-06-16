import { afterEach, describe, expect, it, vi } from "vitest";
import { clearRemoteTokenCache } from "../core/api";
import { createRemoteNdjsonChatTransport, ndjsonChatTransport } from "./transport";
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
  clearRemoteTokenCache();
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

  it("streams remote chat frames with a browser token", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        return new Response(
          JSON.stringify({
            accessToken: "fake-browser-token",
            audience: "https://crm.example.test",
            expiresIn: 120,
            scopes: ["chat.write"],
            tokenType: "Bearer",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return streamResponse(['{"type":"text","value":"Hi"}\n', '{"type":"done"}\n']);
    });
    vi.stubGlobal("fetch", fetchMock);

    const transport = createRemoteNdjsonChatTransport({
      audience: "https://crm.example.test",
      source: "fixtures.crm",
      nodeId: "crm-chat",
      nodeType: "remote.chat-box",
      ref: "sealed-ref",
      scopes: ["chat.write"],
      tokenEndpoint: "/custom/remote-tokens/fixtures.crm",
    });

    const frames: ChatFrame[] = [];
    for await (const f of transport({
      url: "https://crm.example.test/chat/stream",
      body: { message: "hi" },
      signal: new AbortController().signal,
    })) {
      frames.push(f);
    }

    expect(frames).toEqual([{ type: "text", value: "Hi" }, { type: "done" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://crm.example.test/chat/stream",
      expect.objectContaining({
        body: JSON.stringify({ message: "hi" }),
        headers: {
          Accept: "application/x-ndjson",
          "Accept-Language": "en",
          Authorization: "Bearer fake-browser-token",
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );
  });
});
