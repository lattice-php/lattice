import { UI_NAMESPACE, useT } from "../i18n";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "../components/button/button";
import { IconButton } from "./icon-button";

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
  iconOnly?: boolean;
  children?: ReactNode;
}

export function CopyButton({
  value,
  label,
  testId,
  className,
  iconOnly = false,
  children,
}: CopyButtonProps): ReactNode {
  const { t } = useT(UI_NAMESPACE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1500);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy(): Promise<void> {
    if (await copyToClipboard(value)) {
      setCopied(true);
    }
  }

  const ariaLabel = copied
    ? t("common.copied-value", "Copied {{label}}", { label })
    : t("common.copy-value", "Copy {{label}}", { label });

  if (iconOnly) {
    return (
      <IconButton
        icon={copied ? "check" : "copy"}
        label={ariaLabel}
        data-test={testId}
        className={className}
        onClick={() => void handleCopy()}
      />
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      emphasis="outline"
      icon={copied ? "check" : "copy"}
      data-test={testId}
      className={className}
      aria-label={ariaLabel}
      onClick={() => void handleCopy()}
    >
      {copied ? t("common.copied", "Copied") : (children ?? t("common.copy", "Copy"))}
    </Button>
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
