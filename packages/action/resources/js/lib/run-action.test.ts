import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionEffect } from "@lattice-php/ui/effects/dispatch";
import { dispatchActionError } from "@lattice-php/ui/effects/dispatch";
import { runAction } from "./run-action";

vi.mock("@lattice-php/ui/effects/dispatch", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@lattice-php/ui/effects/dispatch")>()),
  dispatchActionError: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runAction", () => {
  it("dispatches effects and reports success on a 2xx response", async () => {
    const effect = { type: "toast" } as ActionEffect;
    const request = (): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify({ effects: [effect] }), { status: 200 }));
    const dispatch = vi.fn<(effects: ActionEffect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(true);

    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("dispatches effects but reports failure on a non-2xx response", async () => {
    const effect = { type: "toast" } as ActionEffect;
    const request = (): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify({ effects: [effect] }), { status: 422 }));
    const dispatch = vi.fn<(effects: ActionEffect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(false);

    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("routes a thrown/network error through the action error event", async () => {
    const error = new Error("network down");
    const request = (): Promise<Response> => Promise.reject(error);
    const dispatch = vi.fn<(effects: ActionEffect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(false);

    expect(dispatchActionError).toHaveBeenCalledWith(error);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
