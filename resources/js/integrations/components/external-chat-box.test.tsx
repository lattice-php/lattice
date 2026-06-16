import { render, screen, waitFor } from "@testing-library/react";
import type { Node } from "@lattice-php/lattice/core/types";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { clearRemoteTokenCache } from "@lattice-php/lattice/core/api";
import { chatPlugin } from "@lattice-php/lattice/chat";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ExternalChatBox } from "./external-chat-box";

function withRegistry(ui: ReactNode): ReactNode {
  const registry = createRegistry(chatPlugin);
  return <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>;
}

function node(): Node<"remote.external-chat-box"> {
  return {
    id: "crm-chat",
    type: "remote.external-chat-box",
    props: {
      conversationId: null,
      fill: false,
      historyEndpoint: "https://crm.example.test/chat/history",
      placeholder: "Ask CRM",
      remote: {
        audience: "https://crm.example.test",
        integration: "fixtures.crm",
        nodeId: "crm-chat",
        nodeType: "remote.external-chat-box",
        ref: "sealed-ref",
        scopes: ["chat.read", "chat.write"],
      },
      streamEndpoint: "https://crm.example.test/chat/stream",
      title: "CRM assistant",
    },
  };
}

describe("ExternalChatBox", () => {
  afterEach(() => {
    clearRemoteTokenCache();
    vi.unstubAllGlobals();
    document.cookie = "XSRF-TOKEN=;path=/;max-age=0";
  });

  it("loads external chat history with a scoped browser token", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const fetchMock = vi.fn<typeof fetch>(async (url) => {
      if (String(url) === "/lattice/integrations/fixtures.crm/token") {
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

    render(withRegistry(<ExternalChatBox node={node()}>{null}</ExternalChatBox>));

    expect(await screen.findByText("Previous answer")).toBeVisible();

    const tokenInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(tokenInit.body).toBe(
      JSON.stringify({
        nodeId: "crm-chat",
        nodeType: "remote.external-chat-box",
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
});
