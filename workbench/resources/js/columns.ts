import { lazyComponent } from "@lattice-php/lattice";
import type { Plugin } from "@lattice-php/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = {
  name: "workbench",
  extensions: {
    "table.columns": {
      "column.status-badge": StatusBadgeCell,
    },
  },
  components: {
    "echo-status": lazyComponent(() => import("./components/EchoStatus")),
  },
} satisfies Plugin;
