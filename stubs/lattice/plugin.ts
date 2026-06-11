import { createPlugin } from "@lattice-php/lattice";

// Register your custom Lattice components and fields here.
// `php artisan lattice:field` and `lattice:component` append entries automatically.
export const appPlugin = createPlugin({
  name: "app",
  components: {},
});
