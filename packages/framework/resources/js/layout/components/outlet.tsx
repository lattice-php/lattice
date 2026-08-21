import type { RendererComponent } from "@lattice-php/core/types";
import { useOutlet } from "../hooks/context";

/**
 * Renders the active page at the position the layout schema places it.
 */
const OutletComponent: RendererComponent<"outlet"> = () => {
  return <>{useOutlet()}</>;
};

export default OutletComponent;
