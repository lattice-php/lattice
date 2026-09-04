import { describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { dispatchActionError } from "./dispatch";
import { runAction } from "./run-action";
import type { Effect } from "./types";

vi.mock("./dispatch", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./dispatch")>()),
  dispatchActionError: vi.fn(),
}));

describe("runAction", () => {
  it("dispatches effects and reports success on a 2xx response", async () => {
    const effect = { type: "toast" } as Effect;
    const request = (): Promise<Response> => Promise.resolve(jsonResponse({ effects: [effect] }));
    const dispatch = vi.fn<(effects: Effect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(true);

    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("dispatches effects but reports failure on a non-2xx response", async () => {
    const effect = { type: "toast" } as Effect;
    const request = (): Promise<Response> =>
      Promise.resolve(jsonResponse({ effects: [effect] }, { status: 422 }));
    const dispatch = vi.fn<(effects: Effect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(false);

    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("routes a thrown/network error through the action error event", async () => {
    const error = new Error("network down");
    const request = (): Promise<Response> => Promise.reject(error);
    const dispatch = vi.fn<(effects: Effect[]) => void>();

    await expect(runAction(request, dispatch)).resolves.toBe(false);

    expect(dispatchActionError).toHaveBeenCalledWith(error);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
