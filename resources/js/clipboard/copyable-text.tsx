import { useT } from "@lattice-php/lattice/i18n";
import { Icon } from "@lattice-php/lattice/icons";
import { type ReactNode, useEffect, useState } from "react";
import { copyToClipboard } from ".";

interface CopyableTextProps {
  value: string;
  label: string;
  testId?: string;
  children?: ReactNode;
}

export function CopyableText({ value, label, testId, children }: CopyableTextProps): ReactNode {
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
    ? t("common.copiedValue", "Copied {{label}}", { label })
    : t("common.copyValue", "Copy {{label}}", { label });

  return (
    <div className="inline-flex items-center gap-2">
      {children ?? value}
      <button
        type="button"
        data-test={testId}
        className="inline-flex items-center gap-1 rounded-lt-sm border border-lt-border px-2 py-1 text-xs"
        aria-label={ariaLabel}
        onClick={handleCopy}
      >
        <Icon name={copied ? "check" : "copy"} className="size-lt-icon-xs" />
        {copied ? t("common.copied", "Copied") : t("common.copy", "Copy")}
      </button>
    </div>
  );
}
