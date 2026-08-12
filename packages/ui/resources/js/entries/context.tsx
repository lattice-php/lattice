import { createContext, useContext } from "react";

/**
 * How the owning list renders its rows. `description-list` puts each pair in a
 * `<dt>`/`<dd>`; `list` falls back to `role="listitem"` because a disclosure
 * row is a button, which may not wrap a `<dt>`/`<dd>` pair.
 */
export type DescriptionListSemantic = "description-list" | "list";

const DescriptionListContext = createContext<DescriptionListSemantic>("description-list");

export const DescriptionListProvider = DescriptionListContext.Provider;

export function useDescriptionListSemantic(): DescriptionListSemantic {
  return useContext(DescriptionListContext);
}
