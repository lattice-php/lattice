import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import { testIdentity } from "@lattice-php/core/test-id";
import { Button } from "@lattice-php/ui/components/button";
import { useT } from "@lattice-php/ui/i18n";

type PromptInputProps = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function PromptInput({
  onSubmit,
  disabled = false,
  placeholder,
}: PromptInputProps): ReactNode {
  const { t } = useT("chat");
  const [value, setValue] = useState("");

  function submit(): void {
    const trimmed = value.trim();
    if (trimmed === "" || disabled) {
      return;
    }

    onSubmit(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-lt-border p-3">
      <textarea
        aria-label={t("chat.input-label", "Message input")}
        className={cn(
          "min-h-[2.5rem] flex-1 resize-none rounded-lt-sm border border-lt-input bg-lt-bg px-3 py-2 text-sm text-lt-fg placeholder:text-lt-muted-fg focus:outline-none focus:ring-[length:var(--lt-ring-width)] focus:ring-lt-ring/50 disabled:bg-lt-disabled disabled:text-lt-disabled-fg",
        )}
        data-slot="prompt-input"
        data-test={testIdentity("chat-input")}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        value={value}
      />
      <Button
        data-test={testIdentity("chat-send")}
        disabled={disabled}
        onClick={submit}
        size="sm"
        type="button"
      >
        {t("chat.send", "Send")}
      </Button>
    </div>
  );
}
