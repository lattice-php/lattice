/**
 * Single source of truth for the `lattice:*` DOM events the runtime dispatches
 * and listens for. The built-in effect handlers in effects/registry.ts bridge
 * effects to these events; the rest are framework events with no PHP counterpart.
 */
export declare const LATTICE_EVENT: {
    readonly callout: "lattice:callout";
    readonly retractCallout: "lattice:retract-callout";
    readonly toast: "lattice:toast";
    readonly reloadComponent: "lattice:reload-component";
    readonly openModal: "lattice:open-modal";
    readonly closeModal: "lattice:close-modal";
    readonly resetForm: "lattice:reset-form";
    readonly toggleSidebar: "lattice:toggle-sidebar";
    readonly appearanceChange: "lattice:appearance-change";
    readonly localeChange: "lattice:locale-change";
    readonly timezoneChange: "lattice:timezone-change";
    readonly actionError: "lattice:action-error";
};
export type ReloadComponentEvent = CustomEvent<{
    component?: string;
    type?: string;
}>;
