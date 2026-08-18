import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const OutletContext = createContext<ReactNode>(null);

export function OutletProvider({ outlet, children }: { outlet: ReactNode; children: ReactNode }) {
  return <OutletContext.Provider value={outlet}>{children}</OutletContext.Provider>;
}

export function useOutlet(): ReactNode {
  return useContext(OutletContext);
}
