import { afterEach, describe, expect, it, vi } from "vitest";
import { executeRequest } from "./execute-request";
import type { BuiltRequest } from "./request-builder";

const request: BuiltRequest = {
  method: "PATCH",
  url: "https://api.example.test/widgets/42",
  headers: { "Content-Type": "application/json", Authorization: "Bearer secret-token" },
  body: '{"name":"Desk"}',
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFetch(response: Response): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

describe("executeRequest", () => {
  it("forwards the built request and signal to fetch", async () => {
    const signal = new AbortController().signal;
    mockFetch(new Response("updated", { status: 200 }));

    await executeRequest(request, signal);

    expect(fetch).toHaveBeenCalledWith(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal,
    });
  });

  it("pretty prints JSON responses regardless of their content type", async () => {
    mockFetch(
      new Response('{"name":"Desk","tags":["office","sale"]}', {
        headers: { "Content-Type": "text/plain" },
      }),
    );

    await expect(executeRequest(request, new AbortController().signal)).resolves.toMatchObject({
      kind: "response",
      body: '{\n  "name": "Desk",\n  "tags": [\n    "office",\n    "sale"\n  ]\n}',
      contentType: "text/plain",
    });
  });

  it("preserves text and malformed JSON responses", async () => {
    mockFetch(new Response("not json", { headers: { "Content-Type": "application/json" } }));

    await expect(executeRequest(request, new AbortController().signal)).resolves.toMatchObject({
      kind: "response",
      body: "not json",
    });
  });

  it("normalizes an empty 204 response", async () => {
    mockFetch(new Response(null, { status: 204, statusText: "No Content" }));

    await expect(executeRequest(request, new AbortController().signal)).resolves.toMatchObject({
      kind: "response",
      status: 204,
      statusText: "No Content",
      body: "",
      contentType: null,
    });
  });

  it.each([404, 500])(
    "returns HTTP %s responses without treating them as transport errors",
    async (status) => {
      mockFetch(new Response("failure", { status, statusText: "Failed" }));

      await expect(executeRequest(request, new AbortController().signal)).resolves.toMatchObject({
        kind: "response",
        status,
        body: "failure",
      });
    },
  );

  it("sorts response headers and measures the full request duration", async () => {
    mockFetch(
      new Response("ok", {
        headers: {
          "X-Zeta": "last",
          "Content-Type": "text/plain",
          "X-Alpha": "first",
        },
      }),
    );
    vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(175);

    await expect(executeRequest(request, new AbortController().signal)).resolves.toMatchObject({
      kind: "response",
      durationMs: 75,
      headers: [
        ["content-type", "text/plain"],
        ["x-alpha", "first"],
        ["x-zeta", "last"],
      ],
    });
  });

  it("clamps a negative elapsed duration to zero", async () => {
    mockFetch(new Response("ok"));
    vi.spyOn(Date, "now").mockReturnValueOnce(175).mockReturnValueOnce(100);

    await expect(executeRequest(request, new AbortController().signal)).resolves.toMatchObject({
      kind: "response",
      durationMs: 0,
    });
  });

  it("returns a generic transport error without leaking request details", async () => {
    const sensitiveFailure = new Error(
      `${request.url} ${request.headers.Authorization} ${request.body} ${request.headers["Content-Type"]}`,
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(sensitiveFailure));

    const result = await executeRequest(request, new AbortController().signal);

    expect(result).toEqual({
      kind: "error",
      message: "Request failed. Check the browser console and CORS configuration.",
    });
    expect(result.kind === "error" && result.message).not.toContain(request.url);
    expect(result.kind === "error" && result.message).not.toContain(request.headers.Authorization);
    expect(result.kind === "error" && result.message).not.toContain(request.body ?? "");
  });

  it("rethrows aborted requests", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(executeRequest(request, new AbortController().signal)).rejects.toBe(abortError);
  });
});
