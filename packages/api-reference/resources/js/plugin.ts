import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

const plugin: Plugin = {
  name: "api-reference",
  components: {
    "api-reference": lazyComponent(() => import("./api-reference/lattice")),
  },
};

export default plugin;
