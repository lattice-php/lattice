import { render, screen, waitFor } from "@testing-library/react";
import type { Node } from "@lattice-php/lattice/core/types";
import { clearRemoteTokenCache } from "@lattice-php/lattice/core/api";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { actionComponents } from "@lattice-php/lattice/action";
import { coreComponents } from "@lattice-php/lattice/core/components";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
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
    },
    schema: [
      {
        key: "name",
        props: {
          align: null,
          color: "default",
          dataBindings: {
            text: "name",
          },
          size: "md",
          text: "",
        },
        type: "text",
      },
      {
        key: "email",
        props: {
          align: null,
          color: "muted",
          dataBindings: {
            text: "email",
          },
          size: "sm",
          text: "",
        },
        type: "text",
      },
    ],
  };
}

function schemaNode(): Node<"remote.data-list"> {
  return {
    ...node(),
    schema: [
      {
        key: "row-card",
        props: {
          dataBindings: {
            title: "name",
          },
          description: null,
          title: null,
        },
        schema: [
          {
            key: "email",
            props: {
              align: null,
              color: "muted",
              dataBindings: {
                text: "email",
              },
              size: "sm",
              text: "",
            },
            type: "text",
          },
          {
            id: "open-customer",
            props: {
              confirmation: null,
              dataBindings: {
                label: "actionLabel",
              },
              effects: [],
              endpoint: "/customers/open",
              form: null,
              icon: null,
              label: "Open",
              lazyForm: null,
              method: "get",
              ref: null,
              variant: "secondary",
            },
            type: "action",
          },
        ],
        type: "card",
      },
    ],
  } as unknown as Node<"remote.data-list">;
}

function withRegistry(ui: ReactNode): ReactNode {
  return (
    <RegistryContext.Provider value={createRegistry(coreComponents, actionComponents)}>
      {ui}
    </RegistryContext.Provider>
  );
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

    render(withRegistry(<DataList node={node()}>{null}</DataList>));

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

  it("renders the child schema once per remote row using data bindings", async () => {
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
        JSON.stringify({
          data: [
            {
              id: 1,
              actionLabel: "Open Ada",
              email: "ada@example.test",
              name: "Ada Lovelace",
            },
            {
              id: 2,
              actionLabel: "Open Grace",
              email: "grace@example.test",
              name: "Grace Hopper",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(withRegistry(<DataList node={schemaNode()}>{null}</DataList>));

    expect(await screen.findByText("Ada Lovelace")).toBeVisible();
    expect(screen.getByText("ada@example.test")).toBeVisible();
    expect(screen.getByRole("button", { name: "Open Ada" })).toBeVisible();
    expect(screen.getByText("Grace Hopper")).toBeVisible();
    expect(screen.getByText("grace@example.test")).toBeVisible();
    expect(screen.getByRole("button", { name: "Open Grace" })).toBeVisible();
  });
});
