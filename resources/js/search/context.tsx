import { createContext, useContext, type ReactNode } from "react";
import type { UseSearchReturn } from "./types";

const SearchContext = createContext<UseSearchReturn | null>(null);

export function SearchProvider({
  value,
  children,
}: {
  value: UseSearchReturn;
  children: ReactNode;
}) {
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext(): UseSearchReturn {
  const context = useContext(SearchContext);

  if (context === null) {
    throw new Error("useSearchContext must be used within a <SearchBox> root.");
  }

  return context;
}
