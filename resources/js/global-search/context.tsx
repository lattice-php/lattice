import { createContext, useContext, type ReactNode } from "react";
import type { UseGlobalSearchReturn } from "./types";

const GlobalSearchContext = createContext<UseGlobalSearchReturn | null>(null);

export function GlobalSearchProvider({
  value,
  children,
}: {
  value: UseGlobalSearchReturn;
  children: ReactNode;
}) {
  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>;
}

export function useGlobalSearchContext(): UseGlobalSearchReturn {
  const context = useContext(GlobalSearchContext);

  if (context === null) {
    throw new Error("useGlobalSearchContext must be used within a <GlobalSearch> root.");
  }

  return context;
}
