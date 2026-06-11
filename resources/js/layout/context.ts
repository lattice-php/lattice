import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * Carries the active page element down through a server-composed layout schema
 * so the Outlet component can render it wherever the layout places it.
 */
export const OutletContext = createContext<ReactNode>(null);

/**
 * Whether the enclosing Sidebar is collapsed to its icon rail. Menu items read
 * this to render icon-only and surface their submenu as a flyout instead.
 */
export const SidebarCollapsedContext = createContext(false);

export function useSidebarCollapsed(): boolean {
  return useContext(SidebarCollapsedContext);
}
