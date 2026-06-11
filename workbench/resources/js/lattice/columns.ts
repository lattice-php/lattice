import { createColumnPlugin } from "@lattice/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = createColumnPlugin({
  name: "workbench",
  columns: {
    "column.status-badge": StatusBadgeCell,
  },
});
