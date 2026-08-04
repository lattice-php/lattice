import type { ReactNode } from "react";
import { useLocale } from "@lattice-php/ui/i18n";
import type { NumberFormat } from "@lattice-php/core/generated";
import { formatNumber } from "@lattice-php/ui/format/number";
import { numericValue } from "@lattice-php/ui/format/numeric";
import { formatCell } from "@lattice-php/table/lib/format";
import type { TableColumn } from "@lattice-php/table/types";
import { CopyableCell } from "./copyable-cell";

/** Shared numeric cell body for the money and number columns. */
export function NumericCell({
  column,
  copyable,
  format,
  value,
}: {
  column: TableColumn;
  copyable?: boolean | null;
  format: NumberFormat;
  value: unknown;
}): ReactNode {
  const { locale } = useLocale();

  if (numericValue(value) === null) {
    return <span>{formatCell(value, column)}</span>;
  }

  return (
    <CopyableCell column={column} copyable={copyable} value={String(value)}>
      <span className="tabular-nums">{formatNumber(value, format, locale)}</span>
    </CopyableCell>
  );
}
