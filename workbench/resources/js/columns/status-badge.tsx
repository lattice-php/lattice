import type { ColumnCellComponent } from "@lattice-php/lattice";
import { useT } from "@lattice-php/lattice/i18n";
import { WORKBENCH_I18N_NAMESPACE } from "../i18n";

const colorClasses: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

export const StatusBadgeCell: ColumnCellComponent = ({ value }) => {
  const label = String(value ?? "");
  const classes = colorClasses[label] ?? "bg-gray-100 text-gray-800";
  const { t } = useT(WORKBENCH_I18N_NAMESPACE);

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {t(`status.${label}`, label)}
    </span>
  );
};
