import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const CollapsedContext = createContext(false);

export function CollapsedProvider({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  return <CollapsedContext.Provider value={collapsed}>{children}</CollapsedContext.Provider>;
}

export function useCollapsed(): boolean {
  return useContext(CollapsedContext);
}
