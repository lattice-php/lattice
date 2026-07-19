import { screen, waitFor } from "@testing-library/react";
import type { Node } from "@lattice-php/lattice/core/types";
import { clearRemoteTokenCache } from "@lattice-php/lattice/core/api";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "@lattice-php/lattice/action";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { uiComponents } from "@lattice-php/lattice/ui/plugin";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataList } from "./data-list";

const registry = createRegistry(uiComponents, actionComponents);

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
        tokenEndpoint: "/custom/remote-tokens/fixtures.crm",
      },
    },
    schema: [
      {
        key: "name",
        props: {
          align: null,
          color: { kind: "named", value: "default", dark: null },
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
          color: { kind: "named", value: "muted", dark: null },
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
  return fakeNode({
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
              color: { kind: "named", value: "muted", dark: null },
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
              lazyForm: false,
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
  });
}

describe("DataList", () => {
  afterEach(() => {
    clearRemoteTokenCache();
    document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
  });

  it("fetches remote rows with a scoped browser token", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
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

    renderWithRegistry(<DataList node={node()}>{null}</DataList>, registry);

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

  it("shows the loading fallback when remote access is missing", () => {
    renderWithRegistry(
      <DataList
        node={{
          ...node(),
          props: {
            ...node().props,
            remote: null,
          },
        }}
      >
        {null}
      </DataList>,
      registry,
    );

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("renders remote fetch errors", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        return new Response(
          JSON.stringify({
            accessToken: "fake-browser-token",
            audience: "https://crm.example.test",
            expiresIn: 120,
            scopes: ["customers.read"],
            tokenType: "Bearer",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response("Failed", { status: 500 });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithRegistry(<DataList node={node()}>{null}</DataList>, registry);

    expect(await screen.findByText("HTTP 500")).toBeVisible();
  });

  it("uses the configured empty label when the remote payload has no rows", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        return new Response(
          JSON.stringify({
            accessToken: "fake-browser-token",
            audience: "https://crm.example.test",
            expiresIn: 120,
            scopes: ["customers.read"],
            tokenType: "Bearer",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithRegistry(
      <DataList
        node={{
          ...node(),
          props: {
            ...node().props,
            emptyLabel: "No customers yet",
          },
        }}
      >
        {null}
      </DataList>,
      registry,
    );

    expect(await screen.findByText("No customers yet")).toBeVisible();
  });

  it("renders the child schema once per remote row using data bindings", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
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

    renderWithRegistry(<DataList node={schemaNode()}>{null}</DataList>, registry);

    expect(await screen.findByText("Ada Lovelace")).toBeVisible();
    expect(screen.getByText("ada@example.test")).toBeVisible();
    expect(screen.getByRole("button", { name: "Open Ada" })).toBeVisible();
    expect(screen.getByText("Grace Hopper")).toBeVisible();
    expect(screen.getByText("grace@example.test")).toBeVisible();
    expect(screen.getByRole("button", { name: "Open Grace" })).toBeVisible();
  });
});
