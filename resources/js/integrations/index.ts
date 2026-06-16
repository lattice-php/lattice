import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import BrowserDataComponent from "./components/browser-data";

export const integrationComponents = createPlugin({
  components: {
    "integration.browser-data": eagerComponent(BrowserDataComponent),
  },
  name: "lattice/integrations",
});
