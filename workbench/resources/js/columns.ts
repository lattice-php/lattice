import { createPlugin } from "@lattice-php/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = createPlugin({
  name: "workbench",
  columns: {
    "column.status-badge": StatusBadgeCell,
  },
});
