import { createColumnPlugin } from "@lattice-php/lattice";

// Register your custom table column cell renderers here.
// `php artisan lattice:column` appends entries automatically.
export const appColumns = createColumnPlugin({
  name: "app",
  columns: {},
});
