/**
 * Single source of truth for the `lattice:*` DOM events the runtime dispatches
 * and listens for. The built-in effect handlers in effects/registry.ts bridge
 * effects to these events; the rest are framework events with no PHP counterpart.
 */
export const LATTICE_EVENT = {
  callout: "lattice:callout",
  retractCallout: "lattice:retract-callout",
  toast: "lattice:toast",
  reloadComponent: "lattice:reload-component",
  openModal: "lattice:open-modal",
  closeModal: "lattice:close-modal",
  resetForm: "lattice:reset-form",
  toggleSidebar: "lattice:toggle-sidebar",
  appearanceChange: "lattice:appearance-change",
  localeChange: "lattice:locale-change",
  timezoneChange: "lattice:timezone-change",
  actionError: "lattice:action-error",
  treeActivate: "lattice:tree-activate",
} as const;

export type ReloadComponentEvent = CustomEvent<{
  component?: string;
  type?: string;
}>;

/**
 * A tree node became the active one. Embedders (a media library filtering its
 * grid by folder, say) react to the selection without owning the tree.
 */
export type TreeActivateEvent = CustomEvent<{
  component?: string;
  nodeId: string;
}>;
