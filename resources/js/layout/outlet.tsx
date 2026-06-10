import { useContext } from "react";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { OutletContext } from "./context";

declare module "@lattice/lattice/core/types" {
  interface ComponentProps {
    outlet: Record<string, never>;
  }
}

/**
 * Renders the active page at the position the layout schema places it.
 */
const OutletComponent: RendererComponent<"outlet"> = () => {
  return <>{useContext(OutletContext)}</>;
};

export default OutletComponent;
