import { copyToClipboard } from "@lattice-php/lattice/clipboard";
import { DateTime } from "@lattice-php/lattice/i18n";
import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { type ReactNode, useEffect, useState } from "react";
import { formatCell, resolveLink } from "../../format";
import type { ColumnCellArgs, ColumnCellComponent } from "../../registry";
import type { ColumnPropsOf } from "../../types";

type TextProps = ColumnCellArgs<"column.text">["props"];

export const TextCell: ColumnCellComponent<"column.text"> = (args) => {
  if (args.props.multiple) {
    return <MultipleCell {...args} />;
  }

  if (args.props.badge) {
    return <SingleBadgeCell {...args} />;
  }

  return <PlainTextCell {...args} />;
};

function Badge({ label, color }: { label: string; color?: string | null }): ReactNode {
  if (label === "") {
    return null;
  }

  return <span className={cn("lt-cell-badge", `lt-cell-tone-${color || "gray"}`)}>{label}</span>;
}

function MultipleCell({ column, props, value }: ColumnCellArgs<"column.text">): ReactNode {
  const items = Array.isArray(value) ? value : [];

  if (items.length === 0) {
    return null;
  }

  if (!props.badge) {
    return <span>{items.map((item) => formatCell(item, column)).join(", ")}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => {
        const chip = item as { value: unknown; color?: string };

        return <Badge key={index} label={formatCell(chip.value, column)} color={chip.color} />;
      })}
    </div>
  );
}

function SingleBadgeCell({ column, props, row, value }: ColumnCellArgs<"column.text">): ReactNode {
  const colorKey = (props.badge as NonNullable<TextProps["badge"]>).colorKey;

  return <Badge label={formatCell(value, column)} color={String(row[colorKey] ?? "")} />;
}

function PlainTextCell({ column, props, row, value }: ColumnCellArgs<"column.text">): ReactNode {
  const dateProps = (column.props as ColumnPropsOf<"column.text"> | null)?.date;
  const href = resolveLink(column, row, value);
  const text = formatCell(value, column);
  const [copied, setCopied] = useState(false);

  if (dateProps && !href && !props.copyable && value !== null && value !== undefined) {
    return <DateTime value={value} format={dateProps.format ?? null} />;
  }

  const content = href ? (
    <a
      className="underline underline-offset-2"
      href={href}
      rel={props.link?.external ? "noreferrer" : undefined}
      target={props.link?.external ? "_blank" : undefined}
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

  if (!props.copyable) {
    return content;
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span>{content}</span>
      <button
        type="button"
        data-test={`copy-${column.key}`}
        className="inline-flex items-center gap-1 rounded-lt-sm border border-lt-border px-2 py-1 text-xs"
        aria-label={`${copied ? "Copied" : "Copy"} ${column.label}`}
        onClick={handleCopy}
      >
        {copied ? (
          <Icon name="check" className="size-lt-icon-xs" />
        ) : (
          <Icon name="copy" className="size-lt-icon-xs" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
