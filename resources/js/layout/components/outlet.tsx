import { useContext } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { OutletContext } from "../hooks/context";

/**
 * Renders the active page at the position the layout schema places it.
 */
const OutletComponent: RendererComponent<"outlet"> = () => {
  return <>{useContext(OutletContext)}</>;
};

export default OutletComponent;
