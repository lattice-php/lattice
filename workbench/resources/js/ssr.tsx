import { createLatticeSsr } from "@lattice-php/lattice/ssr";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

// Plain default export: the workbench only server-renders through the dev
// endpoint and the vitest SSR proof, never as a standalone production process.
export default createLatticeSsr({
  plugins: [appColumns, ...plugins],
  sprite,
  i18n: { namespaces: ["lattice", WORKBENCH_I18N_NAMESPACE] },
});
