import { render, screen, waitFor } from "@testing-library/react";
import type { Node } from "@lattice-php/lattice/core/types";
import { clearRemoteTokenCache } from "@lattice-php/lattice/core/api";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataList } from "./data-list";

function node(): Node<"remote.data-list"> {
  return {
    id: "customers",
    type: "remote.data-list",
    props: {
      dataEndpoint: "https://crm.example.test/customers",
      emptyLabel: null,
      remote: {
        audience: "https://crm.example.test",
        source: "fixtures.crm",
        nodeId: "customers",
        nodeType: "remote.data-list",
        ref: "sealed-ref",
        scopes: ["customers.read"],
      },
      subtitleKey: "email",
      titleKey: "name",
    },
  };
}

describe("DataList", () => {
  afterEach(() => {
    clearRemoteTokenCache();
    vi.unstubAllGlobals();
    document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
  });

  it("fetches remote rows with a scoped browser token", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/lattice/remote-sources/fixtures.crm/token") {
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

      return new Response(
        JSON.stringify({ data: [{ id: 1, name: "Ada Lovelace", email: "ada@example.test" }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DataList node={node()}>{null}</DataList>);

    expect(await screen.findByText("Ada Lovelace")).toBeVisible();
    expect(screen.getByText("ada@example.test")).toBeVisible();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "https://crm.example.test/customers",
        expect.objectContaining({
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            Authorization: "Bearer fake-browser-token",
          },
        }),
      ),
    );
  });
});
