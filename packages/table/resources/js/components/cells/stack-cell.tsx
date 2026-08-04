import { Renderer } from "@lattice-php/core/renderer";
import { materializeSchema } from "@lattice-php/core/materialize";
import type { ColumnCellComponent } from "@lattice-php/table/registry";

export const StackCell: ColumnCellComponent<"column.stack"> = ({ column, row }) => (
  <div className="grid gap-1">
    <Renderer nodes={materializeSchema(column.schema, row)} />
  </div>
);
