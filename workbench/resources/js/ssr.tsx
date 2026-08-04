import { createLatticeSsr } from "@lattice-php/lattice/ssr";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";
import { appPlugin } from "./plugin";

export default createLatticeSsr({
  plugins: [appPlugin, ...plugins],
  sprite,
  i18n: { namespaces: ["lattice", WORKBENCH_I18N_NAMESPACE] },
});
