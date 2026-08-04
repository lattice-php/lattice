import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { isTruthy } from "@lattice-php/ui/lib/is-truthy";
import { useT } from "@lattice-php/ui/i18n";
import type { ColumnCellComponent } from "@lattice-php/table/registry";

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
