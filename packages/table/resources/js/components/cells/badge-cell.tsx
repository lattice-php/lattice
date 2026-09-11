import { Badge } from "@lattice-php/ui/components/badge/badge";
import { formatCell } from "@lattice-php/table/lib/format";
import type { ColumnCellArgs, ColumnCellComponent } from "@lattice-php/table/registry";

type BadgeProps = ColumnCellArgs<"column.badge">["props"];

function colorFor(
  props: BadgeProps,
  value: unknown,
): NonNullable<BadgeProps["colors"]>[string] | undefined {
  return props.colors?.[String(value)];
}

export const BadgeCell: ColumnCellComponent<"column.badge"> = ({ column, props, value }) => {
  if (!Array.isArray(value)) {
    const label = formatCell(value, column);

    return label === "" ? null : <Badge color={colorFor(props, value)}>{label}</Badge>;
  }

  const badges = value
    .map((item: unknown) => ({ item, label: formatCell(item, column) }))
    .filter(({ label }) => label !== "");

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map(({ item, label }, index) => (
        <Badge key={index} color={colorFor(props, item)}>
          {label}
        </Badge>
      ))}
    </div>
  );
};
