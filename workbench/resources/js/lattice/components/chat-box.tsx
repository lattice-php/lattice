import { type KeyboardEvent, useRef, useState } from "react";
import { useStream } from "@laravel/stream-react";
import { xsrfToken } from "@lattice-php/lattice/form/components/form-transport";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatBoxNode = {
  props: {
    endpoint?: string;
  };
};

const bubbleClasses: Record<ChatRole, string> = {
  user: "self-end bg-lt-primary text-lt-primary-fg",
  assistant: "self-start bg-lt-muted text-lt-fg",
};

export const ChatBox = ({ node }: { node: ChatBoxNode }) => {
  const endpoint = node.props.endpoint ?? "";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const replyRef = useRef("");

  const { data, isStreaming, isFetching, send, clearData } = useStream(endpoint, {
    csrfToken: xsrfToken(),
    onData: (chunk) => {
      replyRef.current += chunk;
    },
    onFinish: () => {
      const reply = replyRef.current.trim();
      replyRef.current = "";

      if (reply !== "") {
        setMessages((current) => [...current, { role: "assistant", content: reply }]);
      }

      clearData();
    },
  });

  const isBusy = isStreaming || isFetching;

  function submit(): void {
    const message = input.trim();

    if (message === "" || isBusy || endpoint === "") {
      return;
    }

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    send({ message });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex min-h-48 flex-col gap-2 overflow-y-auto rounded-lt-sm border border-lt-border bg-lt-muted/20 p-3"
        data-test="chat-messages"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[80%] whitespace-pre-wrap rounded-lt-sm px-3 py-2 text-sm ${bubbleClasses[message.role]}`}
            data-test={`chat-message-${message.role}`}
          >
            {message.content}
          </div>
        ))}

        {isBusy && (
          <div
            className={`max-w-[80%] whitespace-pre-wrap rounded-lt-sm px-3 py-2 text-sm ${bubbleClasses.assistant}`}
            data-test="chat-message-streaming"
          >
            {data === "" ? <span className="text-lt-muted-fg">…</span> : data}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          aria-label="Chat message"
          className="flex-1 rounded-lt-sm border border-lt-border bg-lt-bg px-3 py-2 text-sm outline-none focus:border-lt-primary"
          data-test="chat-input"
          disabled={isBusy}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message…"
          type="text"
          value={input}
        />
        <button
          className="rounded-lt-sm bg-lt-primary px-4 py-2 text-sm font-medium text-lt-primary-fg disabled:opacity-50"
          data-test="chat-send"
          disabled={isBusy || input.trim() === ""}
          onClick={submit}
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
