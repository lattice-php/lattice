import { useCallback, useEffect, useRef } from "react";
import { apiFetch } from "@lattice-php/lattice/core/api";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { useChat } from "../use-chat";
import type { ChatMessage } from "../types";
import { MessageList } from "./message-list";
import { PromptInput } from "./prompt-input";

type ChatHistoryResponse = { messages: ChatMessage[] };

export const ChatBox: RendererComponent<"chat.box"> = ({ node }) => {
  const { streamEndpoint, historyEndpoint, placeholder, title, fill } = node.props;
  const { t } = useT("lattice");
  const { messages, status, sendMessage, setMessages } = useChat({
    endpoint: streamEndpoint ?? "",
  });

  const seededRef = useRef(false);

  const seedHistory = useCallback(async (): Promise<void> => {
    if (seededRef.current || !historyEndpoint) {
      return;
    }

    seededRef.current = true;

    const response = await apiFetch(historyEndpoint, { throwOnError: false });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as ChatHistoryResponse;
    setMessages(payload.messages);
  }, [historyEndpoint, setMessages]);

  useEffect(() => {
    void seedHistory();
  }, [seedHistory]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-lt-border bg-lt-bg",
        fill ? "sticky top-0 h-svh w-full" : "h-[28rem] w-80 rounded-lt shadow-lg",
      )}
      data-test={testIdentity("chat-box")}
    >
      <div className="flex items-center border-b border-lt-border px-3 py-2">
        <span className="text-sm font-medium text-lt-fg">{title ?? t("chat.title", "Chat")}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <PromptInput disabled={busy} onSubmit={sendMessage} placeholder={placeholder ?? undefined} />
    </div>
  );
};

export default ChatBox;
