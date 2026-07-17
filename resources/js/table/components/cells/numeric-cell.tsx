import type { ReactNode } from "react";
import { useLocale } from "@lattice-php/lattice/i18n";
import type { NumberFormat } from "@lattice-php/lattice/types";
import { formatNumber } from "@lattice-php/lattice/format/number";
import { numericValue } from "@lattice-php/lattice/format/numeric";
import { formatCell } from "@lattice-php/lattice/table/lib/format";
import type { TableColumn } from "@lattice-php/lattice/table/types";
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
