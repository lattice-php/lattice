import { useCallback, useEffect, useRef, useState } from "react";
import { ndjsonChatTransport } from "@lattice-php/lattice/chat/lib/transport";
import type {
  ChatFrame,
  ChatMessage,
  ChatStatus,
  ChatTransport,
  UseChatReturn,
} from "@lattice-php/lattice/chat/types";

export type UseChatOptions = {
  endpoint: string;
  transport?: ChatTransport;
  initialMessages?: ChatMessage[];
  generateId?: () => string;
};

let idCounter = 0;

function defaultGenerateId(): string {
  idCounter += 1;

  return `chat-${idCounter}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function lastIsAssistant(messages: ChatMessage[]): boolean {
  const last = messages.at(-1);

  return last !== undefined && last.role === "assistant";
}

/**
 * Pure reducer for a single streamed frame: a `text` frame appends to the open
 * assistant text part (opening one if the last part is not text); a `part` frame
 * pushes a complete part, which closes the open text part. Operates immutably on
 * the last assistant message.
 */
export function foldFrame(messages: ChatMessage[], frame: ChatFrame): ChatMessage[] {
  if (!lastIsAssistant(messages)) {
    return messages;
  }

  const index = messages.length - 1;
  const target = messages[index];

  if (frame.type === "text") {
    const parts = [...target.parts];
    const openIndex = parts.length - 1;
    const open = parts[openIndex];

    if (open !== undefined && open.type === "chat.part.text") {
      const openText = (open.props as { text: string }).text;
      parts[openIndex] = { type: "chat.part.text", props: { text: `${openText}${frame.value}` } };
    } else {
      parts.push({ type: "chat.part.text", props: { text: frame.value } });
    }

    const next = [...messages];
    next[index] = { ...target, parts };

    return next;
  }

  if (frame.type === "part") {
    const next = [...messages];
    next[index] = { ...target, parts: [...target.parts, frame.part] };

    return next;
  }

  return messages;
}

export function useChat({
  endpoint,
  transport = ndjsonChatTransport,
  initialMessages = [],
  generateId = defaultGenerateId,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessagesState] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const commitMessages = useCallback((next: ChatMessage[]): void => {
    messagesRef.current = next;
    setMessagesState(next);
  }, []);

  const runTurn = useCallback(
    async (history: ChatMessage[], userText: string): Promise<void> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setStatus("submitted");

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        parts: [{ type: "chat.part.text", props: { text: userText } }],
      };
      const assistantMessage: ChatMessage = { id: generateId(), role: "assistant", parts: [] };
      commitMessages([...history, userMessage, assistantMessage]);
      setStatus("streaming");

      try {
        for await (const frame of transport({
          url: endpoint,
          body: { message: userText },
          signal: controller.signal,
        })) {
          if (frame.type === "done") {
            setStatus("idle");
            continue;
          }

          if (frame.type === "error") {
            setError(frame.message ?? "Chat failed");
            setStatus("error");
            continue;
          }

          commitMessages(foldFrame(messagesRef.current, frame));
        }

        setStatus((current) =>
          current === "streaming" || current === "submitted" ? "idle" : current,
        );
      } catch (caught) {
        if (isAbortError(caught)) {
          setStatus("idle");

          return;
        }

        setError(errorMessage(caught));
        setStatus("error");
      }
    },
    [commitMessages, endpoint, generateId, transport],
  );

  const sendMessage = useCallback(
    (text: string): void => {
      const trimmed = text.trim();
      if (trimmed === "") {
        return;
      }

      lastUserTextRef.current = trimmed;
      void runTurn(messagesRef.current, trimmed);
    },
    [runTurn],
  );

  const stop = useCallback((): void => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const regenerate = useCallback((): void => {
    const userText = lastUserTextRef.current;
    if (userText === null) {
      return;
    }

    const current = messagesRef.current;
    const history = lastIsAssistant(current) ? current.slice(0, -2) : current;
    void runTurn(history, userText);
  }, [runTurn]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { messages, status, error, sendMessage, setMessages: commitMessages, stop, regenerate };
}
