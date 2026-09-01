import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import type { Effect } from "@lattice-php/ui";
import { dispatchActionError } from "@lattice-php/ui/effects/dispatch";
import { callAction } from "./call-action";

const apiFetch = vi.hoisted(() => vi.fn<() => Promise<Response>>());

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

vi.mock("@lattice-php/ui/effects/dispatch", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@lattice-php/ui/effects/dispatch")>()),
  dispatchActionError: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("callAction", () => {
  it("posts the payload as json and resolves ok with the result data", async () => {
    const effect = { type: "toast" } as Effect;
    apiFetch.mockResolvedValue(jsonResponse({ data: { id: 7 }, effects: [effect] }));
    const dispatch = vi.fn<(effects: Effect[]) => void>();
    const node: Node<"action"> | Node<"action.bulk"> = fakeNode({
      props: { endpoint: "/lattice/actions/rename", method: "patch", ref: "sealed-reference" },
      type: "action",
    });

    await expect(callAction(node, { name: "New name" }, dispatch)).resolves.toEqual({
      data: { id: 7 },
      ok: true,
      status: 200,
    });

    expect(apiFetch).toHaveBeenCalledWith("/lattice/actions/rename", {
      body: JSON.stringify({ name: "New name" }),
      method: "patch",
      ref: "sealed-reference",
      throwOnError: false,
    });
    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("defaults the method to post and the ref to empty", async () => {
    apiFetch.mockResolvedValue(jsonResponse({ effects: [] }));
    const node = fakeNode({ props: { endpoint: "/lattice/actions/move" }, type: "action" });

    await callAction(node, { nodeId: "a" }, vi.fn());

    expect(apiFetch).toHaveBeenCalledWith("/lattice/actions/move", {
      body: JSON.stringify({ nodeId: "a" }),
      method: "post",
      ref: "",
      throwOnError: false,
    });
  });

  it("dispatches effects and surfaces the data when the action is rejected", async () => {
    const effect = { type: "toast" } as Effect;
    apiFetch.mockResolvedValue(
      jsonResponse({ data: { reason: "locked" }, effects: [effect] }, { status: 422 }),
    );
    const dispatch = vi.fn<(effects: Effect[]) => void>();
    const node = fakeNode({ props: { endpoint: "/lattice/actions/move" }, type: "action" });

    await expect(callAction(node, {}, dispatch)).resolves.toEqual({
      data: { reason: "locked" },
      ok: false,
      status: 422,
    });

    expect(dispatch).toHaveBeenCalledWith([effect]);
    expect(dispatchActionError).not.toHaveBeenCalled();
  });

  it("resolves ok without a request when the node has no endpoint", async () => {
    const dispatch = vi.fn<(effects: Effect[]) => void>();
    const node = fakeNode({ props: { endpoint: null }, type: "action.bulk" });

    await expect(callAction(node, {}, dispatch)).resolves.toEqual({
      data: {},
      ok: true,
      status: 0,
    });

    expect(apiFetch).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("routes a thrown/network error through the action error event", async () => {
    const error = new Error("network down");
    apiFetch.mockRejectedValue(error);
    const dispatch = vi.fn<(effects: Effect[]) => void>();
    const node = fakeNode({ props: { endpoint: "/lattice/actions/move" }, type: "action" });

    await expect(callAction(node, {}, dispatch)).resolves.toEqual({
      data: {},
      ok: false,
      status: 0,
    });

    expect(dispatchActionError).toHaveBeenCalledWith(error);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("defaults the data to an empty object when the body is not json", async () => {
    apiFetch.mockResolvedValue(new Response("<html></html>", { status: 200 }));
    const dispatch = vi.fn<(effects: Effect[]) => void>();
    const node = fakeNode({ props: { endpoint: "/lattice/actions/move" }, type: "action" });

    await expect(callAction(node, {}, dispatch)).resolves.toEqual({
      data: {},
      ok: true,
      status: 200,
    });

    expect(dispatch).toHaveBeenCalledWith([]);
  });

  it("defaults the data to an empty object when the body carries a non-object data", async () => {
    apiFetch.mockResolvedValue(jsonResponse({ data: "seven", effects: [] }));
    const node = fakeNode({ props: { endpoint: "/lattice/actions/move" }, type: "action" });

    await expect(callAction(node, {}, vi.fn())).resolves.toEqual({
      data: {},
      ok: true,
      status: 200,
    });
  });
});
