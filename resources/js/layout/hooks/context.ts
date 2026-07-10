import { createContext } from "react";
import type { ReactNode } from "react";
import {
  CollapsedContext as SidebarCollapsedContext,
  useCollapsed as useSidebarCollapsed,
} from "@lattice-php/lattice/core/collapsed-context";

export const OutletContext = createContext<ReactNode>(null);

export { SidebarCollapsedContext, useSidebarCollapsed };
