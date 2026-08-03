import { lazyComponent, type Plugin } from "@lattice-php/lattice/runtime";

export default {
  name: "signature-example",
  components: {
    signature: lazyComponent(() => import("./signature")),
  },
  i18n: {
    namespace: "signature-example",
  },
} satisfies Plugin;
