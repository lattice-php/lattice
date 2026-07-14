import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

function isTruthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export const BooleanCell: ColumnCellComponent<"column.boolean"> = ({ value }) => {
  const { t } = useT("lattice");
  const truthy = isTruthy(value);

  return (
    <span aria-label={truthy ? t("common.yes", "Yes") : t("common.no", "No")} role="img">
      <Icon
        name={truthy ? "check" : "x"}
        className={cn("size-lt-icon-md", truthy ? "text-lt-success" : "text-lt-muted-fg")}
      />
    </span>
  );
};
