import { useT } from "@lattice-php/lattice/i18n";
import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { type ReactNode, useEffect, useState } from "react";

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}

interface CopyButtonProps {
  value: string;
  label: string;
  testId?: string;
  className?: string;
}

export function CopyButton({ value, label, testId, className }: CopyButtonProps): ReactNode {
  const { t } = useT("lattice");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1500);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  function handleCopy(): void {
    void copyToClipboard(value);
    setCopied(true);
  }

  const ariaLabel = copied
    ? t("common.copied-value", "Copied {{label}}", { label })
    : t("common.copy-value", "Copy {{label}}", { label });

  return (
    <button
      type="button"
      data-test={testId}
      className={cn(
        "inline-flex items-center gap-1 rounded-lt-sm border border-lt-border px-2 py-1 text-xs",
        className,
      )}
      aria-label={ariaLabel}
      onClick={handleCopy}
    >
      <Icon name={copied ? "check" : "copy"} className="size-lt-icon-xs" />
      {copied ? t("common.copied", "Copied") : t("common.copy", "Copy")}
    </button>
  );
}

interface CopyableTextProps {
  value: string;
  label: string;
  testId?: string;
  children?: ReactNode;
}

export function CopyableText({ value, label, testId, children }: CopyableTextProps): ReactNode {
  return (
    <div className="inline-flex items-center gap-2">
      {children ?? value}
      <CopyButton value={value} label={label} testId={testId} />
    </div>
  );
}
