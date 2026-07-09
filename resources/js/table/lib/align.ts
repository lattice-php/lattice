import type { ColumnAlign } from "@lattice-php/lattice/types/generated";

const TEXT: Record<ColumnAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const JUSTIFY: Record<ColumnAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const JUSTIFY_ITEMS: Record<ColumnAlign, string> = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
};

export const alignText = (align: ColumnAlign): string => TEXT[align];
export const alignJustify = (align: ColumnAlign): string => JUSTIFY[align];
export const alignJustifyItems = (align: ColumnAlign): string => JUSTIFY_ITEMS[align];
