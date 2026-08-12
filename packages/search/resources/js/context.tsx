import { createContext, useContext, type ReactNode } from "react";
import type { UseSearchReturn } from "./types";

export type SearchContextValue = UseSearchReturn & {
  instanceId: string;
  placeholder: string;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({
  value,
  children,
}: {
  value: SearchContextValue;
  children: ReactNode;
}) {
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);

  if (context === null) {
    throw new Error("useSearchContext must be used within a SearchBox.");
  }

  return context;
}
