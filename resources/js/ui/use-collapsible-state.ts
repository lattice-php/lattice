import { useCallback } from "react";
import { usePersistentState } from "@lattice-php/lattice/lib/use-persistent-state";

/**
 * Boolean open/collapsed state remembered in `localStorage` as `"true"`/`"false"`.
 * Shared by the section, collapsible, and sidebar chrome. Callers resolve
 * `rememberState` as `props.rememberState !== false`; the wire prop is always a
 * boolean, so the polarity is uniform across all three.
 */
export function useCollapsibleState(
  storageKey: string,
  fallback: boolean,
  rememberState: boolean,
): [boolean, () => void] {
  const [value, setValue] = usePersistentState<boolean>(storageKey, fallback, {
    enabled: rememberState,
    parse: (raw) => raw === "true",
    serialize: String,
  });

  const toggle = useCallback(() => setValue((current) => !current), [setValue]);

  return [value, toggle];
}
