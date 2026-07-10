import { useCallback, useEffect, useMemo, useRef } from "react";
import { apiFetch, remoteJson } from "@lattice-php/lattice/core/api";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { ChatBox as ChatBoxProps } from "@lattice-php/lattice/types/generated";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import {
  createRemoteNdjsonChatTransport,
  ndjsonChatTransport,
} from "@lattice-php/lattice/chat/lib/transport";
import { useChat } from "@lattice-php/lattice/chat/hooks/use-chat";
import type { ChatMessage } from "@lattice-php/lattice/chat/types";
import { MessageList } from "./message-list";
import { PromptInput } from "./prompt-input";

type ChatHistoryResponse = { messages: ChatMessage[] };

export const ChatBox: RendererComponent<"chat.box"> = ({ node }) => {
  const props: ChatBoxProps = node.props;
  const { t } = useT("lattice");
  const transport = useMemo(
    () => (props.remote ? createRemoteNdjsonChatTransport(props.remote) : ndjsonChatTransport),
    [props.remote],
  );
  const { messages, status, error, sendMessage, setMessages } = useChat({
    endpoint: props.streamEndpoint ?? "",
    transport,
  });

  const seededRef = useRef(false);

  const seedHistory = useCallback(async (): Promise<void> => {
    if (seededRef.current || !props.historyEndpoint) {
      return;
    }

    seededRef.current = true;

    if (props.remote) {
      const payload = await remoteJson<ChatHistoryResponse>(props.historyEndpoint, {
        remote: props.remote,
      });
      setMessages(payload.messages);

      return;
    }

    const response = await apiFetch(props.historyEndpoint, { throwOnError: false });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as ChatHistoryResponse;
    setMessages(payload.messages);
  }, [props.historyEndpoint, props.remote, setMessages]);

  useEffect(() => {
    void seedHistory().catch(() => {});
  }, [seedHistory]);

  const busy = status === "submitted" || status === "streaming";
  const disabled = busy || !props.streamEndpoint;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-lt-border bg-lt-bg",
        props.fill
          ? "sticky top-0 h-full min-h-[28rem] w-full"
          : "h-[28rem] w-80 rounded-lt shadow-lt-lg",
      )}
      data-test={testIdentity("chat-box")}
    >
      <div className="flex items-center border-b border-lt-border px-3 py-2">
        <span className="text-sm font-medium text-lt-fg">
          {props.title ?? t("common.chat.title", "Chat")}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      {error ? (
        <div className="border-t border-lt-danger/40 px-3 py-2 text-xs text-lt-danger">{error}</div>
      ) : null}
      <PromptInput
        disabled={disabled}
        onSubmit={sendMessage}
        placeholder={props.placeholder ?? undefined}
      />
    </div>
  );
};

export default ChatBox;
