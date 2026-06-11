import type { ColumnCellComponent } from "@lattice/lattice";

const colorClasses: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

export const StatusBadgeCell: ColumnCellComponent = ({ value }) => {
  const label = String(value ?? "");
  const classes = colorClasses[label] ?? "bg-gray-100 text-gray-800";

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
};
