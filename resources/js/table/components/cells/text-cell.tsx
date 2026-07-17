import { DateTime } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { coerceColor, namedColor, toneProps } from "@lattice-php/lattice/lib/color";
import type { ReactNode } from "react";
import { formatCell, resolveLink } from "@lattice-php/lattice/table/lib/format";
import type { ColumnCellArgs, ColumnCellComponent } from "@lattice-php/lattice/table/registry";
import type { ColumnPropsOf } from "@lattice-php/lattice/table/types";
import { CopyableCell } from "./copyable-cell";

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

  const tone = toneProps(coerceColor(color) ?? namedColor("gray"));

  return (
    <span className={cn("lt-cell-badge", tone.className)} style={tone.style}>
      {label}
    </span>
  );
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
  const dateProps = (column.props as ColumnPropsOf<"column.text">).date;
  const href = resolveLink(column, row, value);
  const text = formatCell(value, column);

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

  if (dateProps && !href && !props.copyable && value !== null && value !== undefined) {
    return (
      <DateTime value={value} dateStyle={dateProps.dateStyle} timeStyle={dateProps.timeStyle} />
    );
  }

  return (
    <CopyableCell column={column} copyable={props.copyable} value={text}>
      {content}
    </CopyableCell>
  );
}
