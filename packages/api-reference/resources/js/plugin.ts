import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "api-reference",
  components: {
    "api-reference": lazyComponent(() => import("./api-reference/ApiReference")),
  },
} satisfies Plugin;
