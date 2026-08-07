import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "lattice/calendar",
  components: {
    timeline: lazyComponent(() => import("./timeline")),
  },
  i18n: {
    namespace: "calendar",
  },
} satisfies Plugin;
