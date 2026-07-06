declare module "virtual:lattice/plugins" {
  import type { Plugin } from "@lattice-php/lattice";

  const plugins: Plugin[];

  export default plugins;
}
