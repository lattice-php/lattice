import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { foldFrame, useChat } from "./use-chat";
import type { ChatFrame, ChatMessage, ChatTransport } from "../types";

function scriptedTransport(frames: ChatFrame[]): ChatTransport {
  return async function* () {
    for (const f of frames) {
      yield f;
    }
  };
}

function assistant(parts: ChatMessage["parts"]): ChatMessage {
  return { id: "a", role: "assistant", parts };
}

describe("foldFrame", () => {
  it("opens a text part on the open assistant message and appends to it", () => {
    const start = [assistant([])];
    const afterFirst = foldFrame(start, { type: "text", value: "Hello " });
    expect(afterFirst.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "Hello " } },
    ]);

    const afterSecond = foldFrame(afterFirst, { type: "text", value: "world" });
    expect(afterSecond.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "Hello world" } },
    ]);
  });

  it("pushes a part and closes the open text part", () => {
    const start = foldFrame([assistant([])], { type: "text", value: "Searching" });
    const afterPart = foldFrame(start, {
      type: "part",
      part: { type: "chat.part.tool-call", props: { name: "search", args: { q: "x" } } },
    });

    expect(afterPart.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "Searching" } },
      { type: "chat.part.tool-call", props: { name: "search", args: { q: "x" } } },
    ]);

    const afterMoreText = foldFrame(afterPart, { type: "text", value: "done" });
    expect(afterMoreText.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "Searching" } },
      { type: "chat.part.tool-call", props: { name: "search", args: { q: "x" } } },
      { type: "chat.part.text", props: { text: "done" } },
    ]);
  });

  it("does not mutate the input messages", () => {
    const start = [assistant([])];
    foldFrame(start, { type: "text", value: "Hello" });
    expect(start.at(-1)!.parts).toEqual([]);
  });

  it("returns the input unchanged when the last message is not an assistant", () => {
    const messages: ChatMessage[] = [
      { id: "u", role: "user", parts: [{ type: "chat.part.text", props: { text: "hi" } }] },
    ];
    expect(foldFrame(messages, { type: "text", value: "ignored" })).toBe(messages);
  });

  it("returns the input unchanged for frames that are neither text nor part", () => {
    const messages = [assistant([])];
    expect(foldFrame(messages, { type: "done" })).toBe(messages);
  });
});

describe("useChat", () => {
  it("folds text frames into the open assistant text part", async () => {
    const transport = scriptedTransport([
      { type: "text", value: "Hello " },
      { type: "text", value: "world" },
      { type: "done" },
    ]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("idle"));
    const last = result.current.messages.at(-1)!;
    expect(last.role).toBe("assistant");
    expect(last.parts).toEqual([{ type: "chat.part.text", props: { text: "Hello world" } }]);
  });

  it("pushes an optimistic user message and an empty assistant message on send", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transport: ChatTransport = async function* () {
      await gate;
      yield { type: "done" };
    };
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));

    act(() => result.current.sendMessage("hi"));

    await waitFor(() => expect(result.current.status).toBe("streaming"));
    expect(result.current.messages).toEqual([
      {
        id: expect.any(String),
        role: "user",
        parts: [{ type: "chat.part.text", props: { text: "hi" } }],
      },
      { id: expect.any(String), role: "assistant", parts: [] },
    ]);

    act(() => release());
    await waitFor(() => expect(result.current.status).toBe("idle"));
  });

  it("appends a structured part and closes the open text part", async () => {
    const transport = scriptedTransport([
      { type: "text", value: "Searching" },
      {
        type: "part",
        part: { type: "chat.part.tool-call", props: { name: "search", args: { q: "x" } } },
      },
      { type: "done" },
    ]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("find x"));
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "Searching" } },
      { type: "chat.part.tool-call", props: { name: "search", args: { q: "x" } } },
    ]);
  });

  it("sets status to idle on done", async () => {
    const transport = scriptedTransport([{ type: "text", value: "ok" }, { type: "done" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.error).toBeNull();
  });

  it("sets status to error and records the message on an error frame", async () => {
    const transport = scriptedTransport([{ type: "error", message: "boom" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("boom");
  });

  it("sets status to error when the transport throws an Error", async () => {
    const transport: ChatTransport = async function* () {
      yield { type: "text", value: "partial" };
      throw new Error("network down");
    };
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("network down");
  });

  it("stringifies non-Error failures thrown by the transport", async () => {
    const transport: ChatTransport = async function* () {
      const failure: unknown = "boom-string";
      yield { type: "text", value: "partial" };
      throw failure;
    };
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("boom-string");
  });

  it("regenerate does nothing before any message has been sent", () => {
    const transport = scriptedTransport([{ type: "done" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.regenerate());
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
  });

  it("ignores blank messages", () => {
    const transport = scriptedTransport([{ type: "done" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("   "));
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
  });

  it("stop aborts the turn and returns to idle", async () => {
    const transport: ChatTransport = async function* ({ signal }) {
      yield { type: "text", value: "partial" };
      await new Promise<void>((_, reject) => {
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    };
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("streaming"));
    act(() => result.current.stop());
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "partial" } },
    ]);
  });

  it("regenerate drops the last assistant message and re-streams the last user turn", async () => {
    const transport = scriptedTransport([{ type: "text", value: "first" }, { type: "done" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    act(() => result.current.sendMessage("hi"));
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages).toHaveLength(2);

    act(() => result.current.regenerate());
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      id: expect.any(String),
      role: "user",
      parts: [{ type: "chat.part.text", props: { text: "hi" } }],
    });
    expect(result.current.messages.at(-1)!.role).toBe("assistant");
    expect(result.current.messages.at(-1)!.parts).toEqual([
      { type: "chat.part.text", props: { text: "first" } },
    ]);
  });

  it("replaces messages via setMessages", () => {
    const seeded: ChatMessage[] = [
      { id: "1", role: "assistant", parts: [{ type: "chat.part.text", props: { text: "Hi" } }] },
    ];
    const transport = scriptedTransport([{ type: "done" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport }));
    expect(result.current.messages).toEqual([]);

    act(() => result.current.setMessages(seeded));
    expect(result.current.messages).toEqual(seeded);
  });

  it("seeds messages from initialMessages", () => {
    const initialMessages: ChatMessage[] = [
      { id: "1", role: "user", parts: [{ type: "chat.part.text", props: { text: "hello" } }] },
      {
        id: "2",
        role: "assistant",
        parts: [{ type: "chat.part.text", props: { text: "hi there" } }],
      },
    ];
    const transport = scriptedTransport([{ type: "done" }]);
    const { result } = renderHook(() => useChat({ endpoint: "/x", transport, initialMessages }));
    expect(result.current.messages).toEqual(initialMessages);
  });
});
