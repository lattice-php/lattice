import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBrowserToken } from "./use-browser-token";

describe("useBrowserToken", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
  });

  it("requests a browser token from the token endpoint with the component ref", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async () =>
      new Response(
        JSON.stringify({
          accessToken: "fake-browser-token",
          tokenType: "Bearer",
          expiresIn: 120,
          audience: "https://crm.example.test",
          scopes: ["customers.read"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useBrowserToken({
        audience: "https://crm.example.test",
        component: "customers",
        ref: "sealed-ref",
        scopes: ["customers.read"],
        tokenEndpoint: "/lattice/integrations/fixtures.crm/token",
      }),
    );

    await waitFor(() => expect(result.current.token?.accessToken).toBe("fake-browser-token"));

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/lattice/integrations/fixtures.crm/token");
    expect(init.body).toBe(
      JSON.stringify({
        component: "customers",
        audience: "https://crm.example.test",
        scopes: ["customers.read"],
      }),
    );
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "X-Lattice-Ref": "sealed-ref" });
  });
});
