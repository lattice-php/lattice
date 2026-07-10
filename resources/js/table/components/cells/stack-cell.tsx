import { Renderer } from "@lattice-php/lattice/core/renderer";
import { materializeSchema } from "@lattice-php/lattice/core/materialize";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const StackCell: ColumnCellComponent<"column.stack"> = ({ column, row }) => (
  <div className="grid gap-1">
    <Renderer nodes={materializeSchema(column.schema, row)} />
  </div>
);
