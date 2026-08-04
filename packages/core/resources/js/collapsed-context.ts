import { createContext, useContext } from "react";

export const CollapsedContext = createContext(false);

export function useCollapsed(): boolean {
  return useContext(CollapsedContext);
}
