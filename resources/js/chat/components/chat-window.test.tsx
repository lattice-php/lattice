import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { chatPlugin } from "../index";
import { ChatWindow } from "./chat-window";

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

function renderChatWindow(): void {
  render(
    withRegistry(
      <ChatWindow
        node={fakeNode({
          type: "chat.window",
          props: {
            streamEndpoint: "/s",
            historyEndpoint: "/h",
            title: "Assistant",
            placeholder: "Ask…",
          },
        })}
      >
        {null}
      </ChatWindow>,
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ChatWindow component", () => {
  it("toggles the panel from the launcher and closes it again", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => historyResponse());
    vi.stubGlobal("fetch", fetchMock);

    renderChatWindow();

    expect(screen.queryByTestId("chat-panel")).toBeNull();

    fireEvent.click(screen.getByTestId("chat-launcher"));

    expect(await screen.findByTestId("chat-panel")).toBeVisible();
    expect(screen.getByText("Assistant")).toBeVisible();

    fireEvent.click(screen.getByTestId("chat-close"));

    expect(screen.queryByTestId("chat-panel")).toBeNull();
    expect(screen.getByTestId("chat-launcher")).toBeVisible();
  });

  it("renders the panel open immediately when defaultOpen is set", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => historyResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(
      withRegistry(
        <ChatWindow
          node={fakeNode({
            type: "chat.window",
            props: { historyEndpoint: "/h", title: "Assistant", defaultOpen: true },
          })}
        >
          {null}
        </ChatWindow>,
      ),
    );

    expect(await screen.findByTestId("chat-panel")).toBeVisible();
    expect(screen.queryByTestId("chat-launcher")).toBeNull();
  });

  it("fetches history once on open and seeds the conversation", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
      historyResponse(),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderChatWindow();
    fireEvent.click(screen.getByTestId("chat-launcher"));

    expect(await screen.findByText("Hi")).toBeVisible();

    const historyCalls = fetchMock.mock.calls.filter(
      ([, init]) => (init?.method ?? "GET") === "GET",
    );
    expect(historyCalls).toHaveLength(1);
    expect(historyCalls[0]?.[0]).toBe("/h");

    fireEvent.click(screen.getByTestId("chat-close"));
    fireEvent.click(screen.getByTestId("chat-launcher"));
    await screen.findByTestId("chat-panel");

    const afterReopen = fetchMock.mock.calls.filter(
      ([, init]) => (init?.method ?? "GET") === "GET",
    );
    expect(afterReopen).toHaveLength(1);
  });

  it("does not seed messages when the history response is not ok", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) =>
        (init?.method ?? "GET") === "GET"
          ? ({ ok: false, status: 500 } as unknown as Response)
          : historyResponse(),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderChatWindow();
    fireEvent.click(screen.getByTestId("chat-launcher"));

    expect(await screen.findByTestId("chat-panel")).toBeVisible();
    expect(screen.queryByText("Hi")).toBeNull();
  });

  it("falls back to defaults when the title, placeholder, and stream endpoint are omitted", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => historyResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(
      withRegistry(
        <ChatWindow node={fakeNode({ type: "chat.window", props: { historyEndpoint: "/h" } })}>
          {null}
        </ChatWindow>,
      ),
    );
    fireEvent.click(screen.getByTestId("chat-launcher"));

    expect(await screen.findByTestId("chat-panel")).toBeVisible();
    expect(screen.getByTestId("chat-close")).toBeVisible();
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

    renderChatWindow();
    fireEvent.click(screen.getByTestId("chat-launcher"));
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
