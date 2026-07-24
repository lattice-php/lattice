import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { getBulkActions } from "./bulk";
import type { ActionNode } from "@lattice-php/lattice/table/types";

describe("getBulkActions", () => {
  it("returns an empty list when actions is undefined", () => {
    expect(getBulkActions(undefined)).toEqual([]);
  });

  it("returns an empty list when actions is an empty array", () => {
    expect(getBulkActions([])).toEqual([]);
  });

  it("skips action.group nodes", () => {
    const group = fakeNode({
      type: "action.group",
      id: "group",
      props: { label: "Group", orientation: null, ref: null },
    }) as ActionNode;

    expect(getBulkActions([group])).toEqual([]);
  });

  it("skips actions without an endpoint", () => {
    const node = fakeNode({
      type: "action",
      id: "no-endpoint",
      props: { label: "No endpoint" },
    }) as ActionNode;

    expect(getBulkActions([node])).toEqual([]);
  });

  it("maps a fully-specified action node", () => {
    const node = fakeNode({
      type: "action",
      id: "archive",
      props: {
        label: "Archive",
        method: "patch",
        endpoint: "/bulk/archive",
        ref: "the-ref",
        variant: null,
        color: "danger",
        confirmation: {
          title: "Sure?",
          description: null,
          confirmLabel: null,
          cancelLabel: null,
        },
        form: null,
        modalSide: "end",
        modalWidth: "2xl",
      },
    }) as ActionNode;

    expect(getBulkActions([node])).toEqual([
      {
        id: "archive",
        label: "Archive",
        method: "patch",
        endpoint: "/bulk/archive",
        ref: "the-ref",
        variant: "solid",
        color: "danger",
        confirmation: {
          title: "Sure?",
          description: null,
          confirmLabel: null,
          cancelLabel: null,
        },
        form: null,
        modalSide: "end",
        modalWidth: "2xl",
      },
    ]);
  });

  it("applies defaults for every optional field when only endpoint is set", () => {
    const node = fakeNode({
      type: "action",
      props: { endpoint: "/bulk/run" },
    }) as ActionNode;

    expect(getBulkActions([node])).toEqual([
      {
        id: "",
        label: "Run action",
        method: "post",
        endpoint: "/bulk/run",
        ref: "",
        variant: "solid",
        color: null,
        confirmation: undefined,
        form: undefined,
        modalSide: undefined,
        modalWidth: undefined,
      },
    ]);
  });

  it("maps several nodes and drops the ones that should be skipped", () => {
    const group = fakeNode({
      type: "action.group",
      id: "group",
      props: { label: "Group", orientation: null, ref: null },
    }) as ActionNode;
    const noEndpoint = fakeNode({
      type: "action",
      id: "skip",
      props: { label: "Skip" },
    }) as ActionNode;
    const ok = fakeNode({
      type: "action",
      id: "ok",
      props: { label: "Ok", endpoint: "/bulk/ok" },
    }) as ActionNode;

    const result = getBulkActions([group, noEndpoint, ok]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("ok");
  });
});
