import type { ReactNode } from "react";
import { CopyableText } from "@lattice-php/lattice/ui/copyable-text";
import type { TableColumn } from "@lattice-php/lattice/table/types";

/** Wrap cell content in a copy-to-clipboard affordance when `copyable` is set. */
export function CopyableCell({
  children,
  column,
  copyable,
  value,
}: {
  children: ReactNode;
  column: TableColumn;
  copyable?: boolean | null;
  value: string;
}): ReactNode {
  if (!copyable) {
    return children;
  }

  return (
    <CopyableText
      value={value}
      label={column.props.label ?? column.key}
      testId={`copy-${column.key}`}
    >
      {children}
    </CopyableText>
  );
}
