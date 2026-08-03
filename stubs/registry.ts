import { extendRegistry, registry as packageRegistry } from "@lattice-php/lattice";
import type { Plugin } from "@lattice-php/lattice";

// Register your custom Lattice components, fields, and table column cells here.
// `php artisan lattice:component`, `lattice:field`, and `lattice:column` append
// entries automatically.
export const registry = extendRegistry(packageRegistry, {
  name: "app",
  components: {},
  columns: {},
} satisfies Plugin);
