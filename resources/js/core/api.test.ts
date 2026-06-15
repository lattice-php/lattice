import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, apiJson } from "./api";

function okResponse(body: unknown = {}): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
});

describe("apiFetch", () => {
  it("sends same-origin credentials and composes the locale and ref headers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/x", { ref: "sealed-ref" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBe("same-origin");
    expect(init.headers).toMatchObject({
      "Accept-Language": "en",
      "X-Lattice-Ref": "sealed-ref",
      Accept: "application/json",
    });
  });

  it("defaults a GET to a json Accept without csrf or content-type headers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/x");

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
      "Accept-Language": "en",
      Accept: "application/json",
    });
  });

  it("adds the json content-type, ajax marker, and csrf token for write methods", async () => {
    document.cookie = "XSRF-TOKEN=tok%20en";
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/x", { method: "POST" });

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-XSRF-TOKEN": "tok en",
    });
  });

  it("lets the caller override a defaulted header", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/x", { method: "POST", headers: { Accept: "application/x-ndjson" } });

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Accept: "application/x-ndjson",
      "Content-Type": "application/json",
    });
  });

  it("passes through body and signal", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    await apiFetch("/x", { method: "POST", body: "payload", signal });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe("payload");
    expect(init.signal).toBe(signal);
  });

  it("throws ApiError on a non-ok response by default", async () => {
    const response = { ok: false, status: 500 } as unknown as Response;
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => response),
    );

    const error = await apiFetch("/x").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).response).toBe(response);
    expect((error as ApiError).message).toBe("HTTP 500");
  });

  it("returns the response on a non-ok status when throwOnError is false", async () => {
    const response = { ok: false, status: 404 } as unknown as Response;
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => response),
    );

    await expect(apiFetch("/x", { throwOnError: false })).resolves.toBe(response);
  });
});

describe("apiJson", () => {
  it("parses the response body as json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => okResponse({ value: 42 })),
    );

    await expect(apiJson<{ value: number }>("/x")).resolves.toEqual({ value: 42 });
  });

  it("throws ApiError before parsing when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async () => ({ ok: false, status: 422 }) as unknown as Response),
    );

    await expect(apiJson("/x")).rejects.toBeInstanceOf(ApiError);
  });
});
