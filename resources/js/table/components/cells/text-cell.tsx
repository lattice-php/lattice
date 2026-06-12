import { copyToClipboard } from "@lattice/lattice/clipboard";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCell, resolveLink } from "../../format";
import type { TableColumn, TableRow } from "../../types";

export function TextCell({
  column,
  row,
  value,
}: {
  column: TableColumn;
  row: TableRow;
  value: unknown;
}) {
  const text = formatCell(value, column);
  const [copied, setCopied] = useState(false);
  const href = resolveLink(column, row, value);
  const content = href ? (
    <a
      className="underline underline-offset-2"
      href={href}
      rel={column.link?.external ? "noreferrer" : undefined}
      target={column.link?.external ? "_blank" : undefined}
    >
      {text}
    </a>
  ) : (
    text
  );

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1500);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  function handleCopy(): void {
    void copyToClipboard(text);
    setCopied(true);
  }

  if (!column.copyable) {
    return content;
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span>{content}</span>
      <button
        type="button"
        data-test={`copy-${column.key}`}
        className="inline-flex items-center gap-1 rounded border border-lt-border px-2 py-1 text-xs"
        aria-label={`${copied ? "Copied" : "Copy"} ${column.label}`}
        onClick={handleCopy}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3" />
        ) : (
          <Copy aria-hidden="true" className="size-3" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
