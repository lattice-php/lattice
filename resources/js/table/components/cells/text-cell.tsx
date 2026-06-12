import { copyToClipboard } from "@lattice/lattice/clipboard";
import { Icon } from "@lattice/lattice/icons";
import type { TextColumnProps } from "@lattice/lattice/types/generated";
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
  const props = column.props as TextColumnProps | null;
  const text = formatCell(value, column);
  const [copied, setCopied] = useState(false);
  const href = resolveLink(column, row, value);
  const content = href ? (
    <a
      className="underline underline-offset-2"
      href={href}
      rel={props?.link?.external ? "noreferrer" : undefined}
      target={props?.link?.external ? "_blank" : undefined}
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

  if (!props?.copyable) {
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
          <Icon name="check" className="size-3" />
        ) : (
          <Icon name="copy" className="size-3" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
