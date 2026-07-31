import type { Page } from "@inertiajs/core";
import { createLatticeApp } from "@lattice-php/lattice";
import { renderToString } from "react-dom/server";
import sprite from "virtual:svg-sprite";
import plugins from "virtual:lattice/plugins";
import { appColumns } from "./columns";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

// On the server (no `page`/`render` options) createLatticeApp resolves to
// Inertia's SSR render function; `@inertiajs/vite` only auto-wraps literal
// `createInertiaApp` calls, so a Lattice app exports the wrapper itself.
const app = createLatticeApp({
  plugins: [appColumns, ...plugins],
  sprite,
  i18n: { namespaces: ["lattice", WORKBENCH_I18N_NAMESPACE] },
});

export default async function render(page: Page) {
  const ssr = await app;

  if (typeof ssr !== "function") {
    throw new Error("createLatticeApp did not return an SSR render function");
  }

  return ssr(page, renderToString);
}
