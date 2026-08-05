declare module "virtual:lattice/plugins" {
  import type { Plugin } from "@lattice-php/lattice";

  /** Plugins for the Composer-installed Lattice component packages the `lattice()` Vite plugin discovered. */
  const plugins: Plugin[];

  export default plugins;
}
