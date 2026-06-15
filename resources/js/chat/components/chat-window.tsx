import { useCallback, useEffect, useRef, useState } from "react";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Button } from "@lattice-php/lattice/core/components/button";
import { useT } from "@lattice-php/lattice/i18n";
import { useChat } from "../use-chat";
import type { ChatMessage } from "../types";
import { MessageList } from "./message-list";
import { PromptInput } from "./prompt-input";

type ChatHistoryResponse = { messages: ChatMessage[] };

export const ChatWindow: RendererComponent<"chat.window"> = ({ node }) => {
  const { streamEndpoint, historyEndpoint, placeholder, title } = node.props;
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);
  const { messages, status, sendMessage, setMessages } = useChat({
    endpoint: streamEndpoint ?? "",
  });

  const seededRef = useRef(false);

  const seedHistory = useCallback(async (): Promise<void> => {
    if (seededRef.current || !historyEndpoint) {
      return;
    }

    seededRef.current = true;

    const response = await fetch(historyEndpoint, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as ChatHistoryResponse;
    setMessages(payload.messages);
  }, [historyEndpoint, setMessages]);

  useEffect(() => {
    if (open) {
      void seedHistory();
    }
  }, [open, seedHistory]);

  const busy = status === "submitted" || status === "streaming";

  if (!open) {
    return (
      <Button
        data-test={testIdentity("chat-launcher")}
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="default"
      >
        {t("chat.launcher", "Chat")}
      </Button>
    );
  }

  return (
    <div
      className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-lt-md border border-lt-border bg-lt-bg shadow-lg"
      data-test={testIdentity("chat-panel")}
    >
      <div className="flex items-center justify-between border-b border-lt-border px-3 py-2">
        <span className="text-sm font-medium text-lt-fg">{title ?? t("chat.title", "Chat")}</span>
        <Button
          data-test={testIdentity("chat-close")}
          onClick={() => setOpen(false)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {t("chat.close", "Close")}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <PromptInput disabled={busy} onSubmit={sendMessage} placeholder={placeholder ?? undefined} />
    </div>
  );
};

export default ChatWindow;
