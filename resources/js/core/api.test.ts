import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiFetch,
  apiJson,
  clearRemoteTokenCache,
  remoteFetch,
  remoteJson,
  type RemoteAccess,
} from "./api";

function okResponse(body: unknown = {}): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

afterEach(() => {
  clearRemoteTokenCache();
  document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
});

const remote: RemoteAccess = {
  audience: "https://crm.example.test",
  source: "fixtures.crm",
  nodeId: "customers",
  nodeType: "remote.data-list",
  ref: "sealed-ref",
  scopes: ["customers.read"],
  tokenEndpoint: "/custom/remote-tokens/fixtures.crm",
};

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

  it("sends an empty csrf token on a write when no XSRF-TOKEN cookie is present", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/x", { method: "POST" });

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({ "X-XSRF-TOKEN": "" });
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

  it("upper-cases the request method so a lower-case verb is normalized", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/x", { method: "patch" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("PATCH");
    expect(init.headers).toMatchObject({ "X-Requested-With": "XMLHttpRequest" });
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

describe("remoteFetch", () => {
  it("exchanges one browser token per source, audience, and scopes", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        return okResponse({
          accessToken: "fake-browser-token",
          audience: "https://crm.example.test",
          expiresIn: 120,
          scopes: ["customers.read"],
          tokenType: "Bearer",
        });
      }

      return okResponse({ data: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    await remoteJson("https://crm.example.test/customers", { remote });
    await remoteJson("https://crm.example.test/accounts", {
      remote: { ...remote, nodeId: "accounts", ref: "accounts-ref" },
    });

    const tokenCalls = fetchMock.mock.calls.filter(
      ([url]) => String(url) === "/custom/remote-tokens/fixtures.crm",
    );
    expect(tokenCalls).toHaveLength(1);
    expect(tokenCalls[0]?.[1]?.body).toBe(
      JSON.stringify({
        nodeId: "customers",
        nodeType: "remote.data-list",
        audience: "https://crm.example.test",
        scopes: ["customers.read"],
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://crm.example.test/accounts",
      expect.objectContaining({
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          Authorization: "Bearer fake-browser-token",
        },
      }),
    );
  });

  it("refreshes a cached token once when a remote request is unauthorized", async () => {
    let tokenCount = 0;
    let remoteCount = 0;
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        tokenCount += 1;

        return okResponse({
          accessToken: `fake-browser-token-${tokenCount}`,
          audience: "https://crm.example.test",
          expiresIn: 120,
          scopes: ["customers.read"],
          tokenType: "Bearer",
        });
      }

      remoteCount += 1;

      return remoteCount === 1
        ? ({ ok: false, status: 401 } as unknown as Response)
        : okResponse({ data: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await remoteFetch("https://crm.example.test/customers", { remote });

    expect(response.ok).toBe(true);
    expect(tokenCount).toBe(2);
    expect(remoteCount).toBe(2);
    expect(fetchMock.mock.calls.at(-1)?.[1]?.headers).toMatchObject({
      Authorization: "Bearer fake-browser-token-2",
    });
  });

  it("shares a pending browser token request for concurrent remote calls", async () => {
    let tokenCount = 0;
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        tokenCount += 1;
        await Promise.resolve();

        return okResponse({
          accessToken: "fake-browser-token",
          audience: "https://crm.example.test",
          expiresIn: 120,
          scopes: ["customers.read"],
          tokenType: "Bearer",
        });
      }

      return okResponse({ data: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      remoteJson("https://crm.example.test/customers", { remote }),
      remoteJson("https://crm.example.test/accounts", {
        remote: { ...remote, nodeId: "accounts", ref: "accounts-ref" },
      }),
    ]);

    expect(tokenCount).toBe(1);
  });

  it("throws ApiError when a remote response fails after token exchange", async () => {
    const response = { ok: false, status: 500 } as unknown as Response;
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        return okResponse({
          accessToken: "fake-browser-token",
          audience: "https://crm.example.test",
          expiresIn: 120,
          scopes: ["customers.read"],
          tokenType: "Bearer",
        });
      }

      return response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = await remoteFetch("https://crm.example.test/customers", {
      remote,
      retryOnUnauthorized: false,
    }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).response).toBe(response);
    expect((error as ApiError).message).toBe("HTTP 500");
  });
});
