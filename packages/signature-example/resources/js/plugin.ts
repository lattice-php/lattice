import { createPlugin, lazyComponent } from "@lattice-php/lattice";

export default createPlugin({
  name: "signature-example",
  components: {
    signature: lazyComponent(() => import("./signature")),
  },
});
