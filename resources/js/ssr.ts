import type { InertiaAppSSRResponse, Page } from "@inertiajs/core";
import { renderToString } from "react-dom/server";
import { createLatticeApp, type CreateLatticeAppOptions } from "./create-app";

/**
 * Build an SSR entry's render function from the same options as `createLatticeApp`.
 * `@inertiajs/vite` only auto-wraps literal `createInertiaApp` calls, so a Lattice
 * app declares its own ssr entry (`inertia({ ssr: "resources/js/ssr.tsx" })`):
 *
 *     import createServer from "@inertiajs/react/server";
 *     import { createLatticeSsr } from "@lattice-php/lattice/ssr";
 *
 *     createServer(createLatticeSsr({ ...same options as app.tsx }));
 *
 * The plugin rewrites that `createServer` call into the dev-server default
 * export plus the production HTTP bootstrap. Where the bootstrap is unwanted
 * (e.g. a test harness), `export default createLatticeSsr(...)` works as-is.
 *
 * Own subpath on purpose: importing react-dom/server from the client bundle
 * would drag the server renderer into the app.
 */
export function createLatticeSsr(
  options: CreateLatticeAppOptions = {},
): (page: Page) => Promise<InertiaAppSSRResponse> {
  const app = createLatticeApp(options);

  return async (page: Page): Promise<InertiaAppSSRResponse> => {
    const render = await app;

    if (typeof render !== "function") {
      throw new Error("[lattice] createLatticeSsr requires a server environment without a DOM.");
    }

    return render(page, renderToString);
  };
}
