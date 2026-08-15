import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "lattice/calendar",
  components: {
    calendar: lazyComponent(() => import("./calendar")),
  },
  i18n: {
    namespace: "calendar",
  },
} satisfies Plugin;
