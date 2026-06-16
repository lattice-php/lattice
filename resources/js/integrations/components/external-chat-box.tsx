import { useCallback, useEffect, useMemo, useRef } from "react";
import { remoteJson, type RemoteAccess } from "@lattice-php/lattice/core/api";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import {
  createRemoteNdjsonChatTransport,
  ndjsonChatTransport,
} from "@lattice-php/lattice/chat/transport";
import { useChat } from "@lattice-php/lattice/chat/use-chat";
import type { ChatMessage } from "@lattice-php/lattice/chat/types";
import { MessageList } from "@lattice-php/lattice/chat/components/message-list";
import { PromptInput } from "@lattice-php/lattice/chat/components/prompt-input";

type ExternalChatBoxProps = {
  fill?: boolean | null;
  historyEndpoint?: string | null;
  placeholder?: string | null;
  remote?: RemoteAccess | null;
  streamEndpoint?: string | null;
  title?: string | null;
};

type ChatHistoryResponse = { messages: ChatMessage[] };

export const ExternalChatBox: RendererComponent<"remote.external-chat-box"> = ({ node }) => {
  const props = node.props as ExternalChatBoxProps;
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
    if (seededRef.current || !props.historyEndpoint || !props.remote) {
      return;
    }

    seededRef.current = true;

    const payload = await remoteJson<ChatHistoryResponse>(props.historyEndpoint, {
      remote: props.remote,
    });

    setMessages(payload.messages);
  }, [props.historyEndpoint, props.remote, setMessages]);

  useEffect(() => {
    void seedHistory().catch(() => {});
  }, [seedHistory]);

  const busy = status === "submitted" || status === "streaming";
  const disabled = busy || !props.remote || !props.streamEndpoint;
  const visibleError = error;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-lt-border bg-lt-bg",
        props.fill ? "sticky top-0 h-svh w-full" : "h-[28rem] w-80 rounded-lt shadow-lg",
      )}
      data-test={testIdentity("chat-box")}
    >
      <div className="flex items-center border-b border-lt-border px-3 py-2">
        <span className="text-sm font-medium text-lt-fg">
          {props.title ?? t("chat.title", "Chat")}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      {visibleError ? (
        <div className="border-t border-lt-danger/40 px-3 py-2 text-xs text-lt-danger">
          {visibleError}
        </div>
      ) : null}
      <PromptInput
        disabled={disabled}
        onSubmit={sendMessage}
        placeholder={props.placeholder ?? undefined}
      />
    </div>
  );
};

export default ExternalChatBox;
