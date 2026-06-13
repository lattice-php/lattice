import type { RowAction as WireRowAction } from "@lattice-php/lattice/types/generated";
import type { RowAction } from "./row-actions";

export type RowActionTranslate = (key: string, fallback: string) => string;

/** Translation key + fallback and icon for each built-in; the server sends null labels. */
const BUILT_IN: Record<"duplicate" | "remove", { key: string; fallback: string; icon: string }> = {
  duplicate: { key: "rowActions.duplicate", fallback: "Duplicate", icon: "copy" },
  remove: { key: "rowActions.remove", fallback: "Remove", icon: "trash-2" },
};

export type RowActionContext = {
  index: number;
  removable: boolean;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  t: RowActionTranslate;
};

/**
 * Resolves the declared wire row actions into the click-wired client actions the
 * kebab renders. `null` (undeclared) falls back to the built-in remove; an empty
 * array disables row actions entirely. Remove is dropped while the row is at its
 * minimum, and built-in labels resolve through i18n when the server sends none.
 */
export function buildRowActions(
  declared: WireRowAction[] | null,
  ctx: RowActionContext,
): RowAction[] {
  const source = declared ?? defaultActions(ctx.removable);

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
    const builtIn = BUILT_IN.duplicate;

    return {
      key: action.key,
      label: action.label ?? ctx.t(builtIn.key, builtIn.fallback),
      icon: action.icon ?? builtIn.icon,
      destructive: action.destructive,
      onClick: () => ctx.onDuplicate(ctx.index),
    };
  }

  if (action.type === "remove") {
    if (!ctx.removable) {
      return null;
    }

    const builtIn = BUILT_IN.remove;

    return {
      key: action.key,
      label: action.label ?? ctx.t(builtIn.key, builtIn.fallback),
      icon: action.icon ?? builtIn.icon,
      destructive: action.destructive,
      onClick: () => ctx.onRemove(ctx.index),
    };
  }

  return null;
}
