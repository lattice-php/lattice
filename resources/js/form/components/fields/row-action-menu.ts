import type { RowAction as WireRowAction } from "@lattice-php/lattice/types/generated";
import type { RowAction } from "./row-actions";

/** Localised display defaults for the built-in row actions; the server sends null. */
const BUILT_IN: Record<"duplicate" | "remove", { label: string; icon: string }> = {
  duplicate: { label: "Duplicate", icon: "copy" },
  remove: { label: "Remove", icon: "trash-2" },
};

export type RowActionContext = {
  index: number;
  removable: boolean;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
};

/**
 * Resolves the declared (or default) wire row actions into the click-wired client
 * actions the kebab renders. An undeclared menu falls back to the built-in remove;
 * remove is dropped while the row sits at its minimum.
 */
export function buildRowActions(declared: WireRowAction[], ctx: RowActionContext): RowAction[] {
  const source = declared?.length ? declared : defaultActions(ctx.removable);

  return source
    .map((action) => toClientAction(action, ctx))
    .filter((action): action is RowAction => action !== null);
}

function defaultActions(removable: boolean): WireRowAction[] {
  if (!removable) {
    return [];
  }

  return [{ type: "remove", key: "remove", label: null, icon: null, destructive: true }];
}

function toClientAction(action: WireRowAction, ctx: RowActionContext): RowAction | null {
  if (action.type === "duplicate") {
    return {
      key: action.key,
      label: action.label ?? BUILT_IN.duplicate.label,
      icon: action.icon ?? BUILT_IN.duplicate.icon,
      destructive: action.destructive,
      onClick: () => ctx.onDuplicate(ctx.index),
    };
  }

  if (action.type === "remove") {
    if (!ctx.removable) {
      return null;
    }

    return {
      key: action.key,
      label: action.label ?? BUILT_IN.remove.label,
      icon: action.icon ?? BUILT_IN.remove.icon,
      destructive: action.destructive,
      onClick: () => ctx.onRemove(ctx.index),
    };
  }

  return null;
}
