import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { chatPlugin } from "../index";
import { ChatBox } from "./chat-box";

function withRegistry(ui: ReactNode): ReactNode {
  const registry = createRegistry(chatPlugin);
  return <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>;
}

function historyResponse(): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      messages: [
        { id: "1", role: "assistant", parts: [{ type: "chat.part.text", props: { text: "Hi" } }] },
      ],
    }),
  } as unknown as Response;
}

function streamResponse(lines: string[]): Response {
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(enc.encode(line));
      }
      controller.close();
    },
  });

  return { ok: true, status: 200, body } as unknown as Response;
}

function renderChatBox(): void {
  render(
    withRegistry(
      <ChatBox
        node={fakeNode({
          type: "chat.box",
          props: {
            streamEndpoint: "/s",
            historyEndpoint: "/h",
            title: "Assistant",
            placeholder: "Ask…",
          },
        })}
      >
        {null}
      </ChatBox>,
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ChatBox component", () => {
  it("renders the chat without a launcher or close control", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => historyResponse());
    vi.stubGlobal("fetch", fetchMock);

    renderChatBox();

    expect(await screen.findByTestId("chat-box")).toBeVisible();
    expect(screen.getByText("Assistant")).toBeVisible();
    expect(screen.queryByTestId("chat-launcher")).toBeNull();
    expect(screen.queryByTestId("chat-close")).toBeNull();
  });

  it("fetches history once on mount and seeds the conversation", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
      historyResponse(),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderChatBox();

    expect(await screen.findByText("Hi")).toBeVisible();

    const historyCalls = fetchMock.mock.calls.filter(
      ([, init]) => (init?.method ?? "GET") === "GET",
    );
    expect(historyCalls).toHaveLength(1);
    expect(historyCalls[0]?.[0]).toBe("/h");
  });

  it("does not seed messages when the history response is not ok", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) =>
        (init?.method ?? "GET") === "GET"
          ? ({ ok: false, status: 500 } as unknown as Response)
          : historyResponse(),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderChatBox();

    expect(await screen.findByTestId("chat-box")).toBeVisible();
    expect(screen.queryByText("Hi")).toBeNull();
  });

  it("falls back to defaults when the title, placeholder, and stream endpoint are omitted", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => historyResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(
      withRegistry(
        <ChatBox node={fakeNode({ type: "chat.box", props: { historyEndpoint: "/h" } })}>
          {null}
        </ChatBox>,
      ),
    );

    expect(await screen.findByTestId("chat-box")).toBeVisible();
  });

  it("sends a message and streams the assistant reply", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => {
        if ((init?.method ?? "GET") === "POST") {
          return streamResponse(['{"type":"text","value":"Hello there"}\n', '{"type":"done"}\n']);
        }

        return historyResponse();
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    renderChatBox();
    await screen.findByText("Hi");

    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("chat-send"));

    expect(await screen.findByText("Hello")).toBeVisible();
    expect(await screen.findByText("Hello there")).toBeVisible();

    await waitFor(() => {
      const posts = fetchMock.mock.calls.filter(([, init]) => init?.method === "POST");
      expect(posts).toHaveLength(1);
    });
  });
});
