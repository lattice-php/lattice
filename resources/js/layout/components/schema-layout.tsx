import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { PagePayload } from "@lattice-php/lattice/core/types";
import { OutletContext } from "../hooks/context";

/**
 * Persistent Inertia layout that renders a server-composed layout schema and
 * exposes the active page (`children`) to the Outlet via context. The same
 * component instance is reused across navigations that share a layout, so
 * shell state (open sidebar, scroll position) survives page visits.
 */
export default function SchemaLayout({ children }: { children: ReactNode }) {
  const lattice = usePage().props.lattice as PagePayload;
  const layout = lattice.layout;

  if (!layout) {
    return <>{children}</>;
  }

  return (
    <OutletContext.Provider value={children}>
      <Renderer nodes={layout.schema} />
    </OutletContext.Provider>
  );
}
