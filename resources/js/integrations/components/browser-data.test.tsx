import { render, screen, waitFor } from "@testing-library/react";
import type { Node } from "@lattice-php/lattice/core/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrowserData } from "./browser-data";

function node(): Node<"integration.browser-data"> {
  return {
    id: "customers",
    type: "integration.browser-data",
    props: {
      audience: "https://crm.example.test",
      dataEndpoint: "/workbench/external/customers",
      endpoint: "/lattice/integrations/fixtures.crm/token",
      ref: "sealed-ref",
      resource: "customers",
      scopes: ["customers.read"],
      tokenEndpoint: "/lattice/integrations/fixtures.crm/token",
    },
  };
}

describe("BrowserData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
  });

  it("fetches external data with the browser token", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/lattice/integrations/fixtures.crm/token") {
        return new Response(
          JSON.stringify({
            accessToken: "fake-browser-token",
            tokenType: "Bearer",
            expiresIn: 120,
            audience: "https://crm.example.test",
            scopes: ["customers.read"],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ data: [{ id: 1, name: "Ada Lovelace" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<BrowserData node={node()}>{null}</BrowserData>);

    expect(await screen.findByText("Ada Lovelace")).toBeVisible();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/workbench/external/customers",
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-browser-token", Accept: "application/json" },
        }),
      ),
    );
  });
});
