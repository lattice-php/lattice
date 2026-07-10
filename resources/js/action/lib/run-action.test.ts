import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionEffect, ActionResponse } from "@lattice-php/lattice/effects/dispatch";
import { dispatchActionError, getActionEffects } from "@lattice-php/lattice/effects/dispatch";
import { runAction } from "./run-action";

vi.mock("@lattice-php/lattice/effects/dispatch", () => ({
  dispatchActionError: vi.fn(),
  getActionEffects: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runAction", () => {
  it("dispatches normalized effects and reports success", async () => {
    const effect = { type: "toast" } as ActionEffect;
    const response = { effects: [effect] } satisfies ActionResponse;
    const request = vi.fn<() => Promise<ActionResponse>>().mockResolvedValue(response);
    const dispatch = vi.fn<(effects: ActionEffect[]) => void>();

    vi.mocked(getActionEffects).mockReturnValue([effect]);

    await expect(runAction(request, dispatch)).resolves.toBe(true);

    expect(request).toHaveBeenCalledTimes(1);
    expect(getActionEffects).toHaveBeenCalledWith(response.effects);
    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("routes failures through the action error event and reports failure", async () => {
    const error = new Error("Action failed");
    const request = vi.fn<() => Promise<ActionResponse>>().mockRejectedValue(error);
    const dispatch = vi.fn<(effects: ActionEffect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(false);

    expect(dispatch).not.toHaveBeenCalled();
    expect(getActionEffects).not.toHaveBeenCalled();
    expect(dispatchActionError).toHaveBeenCalledWith(error);
  });
});
