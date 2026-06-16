import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { ColumnCellComponent } from "../../registry";

function isTruthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

/** Renders a boolean column as a check (truthy) or cross (falsy) icon. */
export const BooleanCell: ColumnCellComponent<"column.boolean"> = ({ value }) => {
  const truthy = isTruthy(value);

  return (
    <span aria-label={String(truthy)} role="img">
      <Icon
        name={truthy ? "check" : "x"}
        className={cn("size-lt-icon-md", truthy ? "text-lt-success" : "text-lt-muted-fg")}
      />
    </span>
  );
};
