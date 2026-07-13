import type { RowAction as WireRowAction } from "@lattice-php/lattice/types/generated";
import { describe, expect, it, vi } from "vitest";
import { buildRowActions, type RowActionContext } from "./row-action-menu";

function wireAction(
  overrides: Partial<WireRowAction> & Pick<WireRowAction, "type">,
): WireRowAction {
  return {
    key: overrides.type,
    label: null,
    icon: null,
    destructive: false,
    ...overrides,
  };
}

function context(overrides: Partial<RowActionContext> = {}): RowActionContext {
  return {
    index: 1,
    removable: true,
    onRemove: vi.fn<(index: number) => void>(),
    onDuplicate: vi.fn<(index: number) => void>(),
    t: (_key, fallback) => fallback,
    ...overrides,
  };
}

describe("buildRowActions", () => {
  it("defaults to a remove action when undeclared (null) and the row is removable", () => {
    const ctx = context();
    const actions = buildRowActions(null, ctx);

    expect(actions).toHaveLength(1);
    expect(actions[0].key).toBe("remove");
    actions[0].onClick();
    expect(ctx.onRemove).toHaveBeenCalledWith(1);
  });

  it("defaults to no actions when undeclared (null) and the row is not removable", () => {
    expect(buildRowActions(null, context({ removable: false }))).toEqual([]);
  });

  it("disables row actions entirely for an explicit empty array", () => {
    expect(buildRowActions([], context())).toEqual([]);
  });

  it("resolves built-in labels through the translator", () => {
    const [action] = buildRowActions(
      [wireAction({ type: "duplicate" })],
      context({ t: (key) => `t:${key}` }),
    );

    expect(action.label).toBe("t:table.row-actions.duplicate");
  });

  it("maps a duplicate action to onDuplicate with client-default label and icon", () => {
    const ctx = context();
    const [action] = buildRowActions([wireAction({ type: "duplicate" })], ctx);

    expect(action.label).toBe("Duplicate");
    expect(action.icon).toBe("copy");
    action.onClick();
    expect(ctx.onDuplicate).toHaveBeenCalledWith(1);
  });

  it("honours overridden label and icon", () => {
    const [action] = buildRowActions(
      [wireAction({ type: "duplicate", label: "Clone", icon: "files" })],
      context(),
    );

    expect(action.label).toBe("Clone");
    expect(action.icon).toBe("files");
  });

  it("drops a declared remove action when the row is not removable", () => {
    const actions = buildRowActions(
      [wireAction({ type: "duplicate" }), wireAction({ type: "remove" })],
      context({ removable: false }),
    );

    expect(actions.map((a) => a.key)).toEqual(["duplicate"]);
  });
});
