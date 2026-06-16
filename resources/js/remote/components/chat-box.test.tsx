import { render, screen, waitFor } from "@testing-library/react";
import type { Node } from "@lattice-php/lattice/core/types";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { clearRemoteTokenCache } from "@lattice-php/lattice/core/api";
import { chatPlugin } from "@lattice-php/lattice/chat";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { RemoteChatBox } from "./chat-box";

function withRegistry(ui: ReactNode): ReactNode {
  const registry = createRegistry(chatPlugin);
  return <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>;
}

function node(): Node<"remote.chat-box"> {
  return {
    id: "crm-chat",
    type: "remote.chat-box",
    props: {
      conversationId: null,
      fill: false,
      historyEndpoint: "https://crm.example.test/chat/history",
      placeholder: "Ask CRM",
      remote: {
        audience: "https://crm.example.test",
        source: "fixtures.crm",
        nodeId: "crm-chat",
        nodeType: "remote.chat-box",
        ref: "sealed-ref",
        scopes: ["chat.read", "chat.write"],
        tokenEndpoint: "/custom/remote-tokens/fixtures.crm",
      },
      streamEndpoint: "https://crm.example.test/chat/stream",
      title: "CRM assistant",
    },
  };
}

describe("RemoteChatBox", () => {
  afterEach(() => {
    clearRemoteTokenCache();
    vi.unstubAllGlobals();
    document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
  });

  it("loads remote chat history with a scoped browser token", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/custom/remote-tokens/fixtures.crm") {
        return new Response(
          JSON.stringify({
            accessToken: "fake-browser-token",
            tokenType: "Bearer",
            expiresIn: 120,
            audience: "https://crm.example.test",
            scopes: ["chat.read", "chat.write"],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          messages: [
            {
              id: "assistant-1",
              role: "assistant",
              parts: [{ type: "chat.part.text", props: { text: "Previous answer" } }],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(withRegistry(<RemoteChatBox node={node()}>{null}</RemoteChatBox>));

    expect(await screen.findByText("Previous answer")).toBeVisible();

    const tokenInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(tokenInit.body).toBe(
      JSON.stringify({
        nodeId: "crm-chat",
        nodeType: "remote.chat-box",
        audience: "https://crm.example.test",
        scopes: ["chat.read", "chat.write"],
      }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "https://crm.example.test/chat/history",
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

  it("skips history loading when remote access is missing", () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    render(
      withRegistry(
        <RemoteChatBox
          node={{
            ...node(),
            props: {
              ...node().props,
              remote: null,
            },
          }}
        >
          {null}
        </RemoteChatBox>,
      ),
    );

    expect(screen.getByText("CRM assistant")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
