import { createContext } from "react";
import type { ReactNode } from "react";

/**
 * Carries the active page element down through a server-composed layout schema
 * so the Outlet component can render it wherever the layout places it.
 */
export const OutletContext = createContext<ReactNode>(null);
