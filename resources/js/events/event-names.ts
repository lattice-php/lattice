/**
 * Single source of truth for the `lattice:*` DOM events the runtime dispatches
 * and listens for. Effect-driven events are mapped from the generated EffectType
 * in action/effects.ts; the rest are framework events with no PHP counterpart.
 */
export const LATTICE_EVENT = {
  toast: "lattice:toast",
  reloadComponent: "lattice:reload-component",
  reloadPage: "lattice:reload-page",
  redirect: "lattice:redirect",
  download: "lattice:download",
  openModal: "lattice:open-modal",
  closeModal: "lattice:close-modal",
  resetForm: "lattice:reset-form",
  appearanceChange: "lattice:appearance-change",
  actionError: "lattice:action-error",
} as const;

export type ReloadComponentEvent = CustomEvent<{
  component?: string;
  type?: string;
}>;
