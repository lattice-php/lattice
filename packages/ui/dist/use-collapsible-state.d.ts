/**
 * Boolean open/collapsed state remembered in `localStorage` as `"true"`/`"false"`.
 * Shared by the section, collapsible, and sidebar chrome. Callers resolve
 * `rememberState` as `props.rememberState !== false`; the wire prop is always a
 * boolean, so the polarity is uniform across all three.
 */
export declare function useCollapsibleState(
  storageKey: string,
  fallback: boolean,
  rememberState: boolean,
): [boolean, () => void];
