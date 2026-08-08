import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { getBulkActions } from "./bulk";
import type { ActionNode } from "@lattice-php/table/types";

describe("getBulkActions", () => {
  it.each([undefined, []])("returns an empty list for %o", (actions) => {
    expect(getBulkActions(actions)).toEqual([]);
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

  it("maps a fully-specified action node and defaults every optional field on a minimal one", () => {
    const full = fakeNode({
      type: "action",
      id: "archive",
      props: {
        label: "Archive",
        method: "patch",
        endpoint: "/bulk/archive",
        ref: "the-ref",
        variant: "danger",
        emphasis: null,
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
    const minimal = fakeNode({
      type: "action",
      props: { endpoint: "/bulk/run" },
    }) as ActionNode;

    expect(getBulkActions([full, minimal])).toEqual([
      {
        id: "archive",
        label: "Archive",
        method: "patch",
        endpoint: "/bulk/archive",
        ref: "the-ref",
        variant: "danger",
        emphasis: null,
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
      {
        id: "",
        label: "Run action",
        method: "post",
        endpoint: "/bulk/run",
        ref: "",
        variant: undefined,
        emphasis: undefined,
        confirmation: undefined,
        form: undefined,
        modalSide: undefined,
        modalWidth: undefined,
      },
    ]);
  });
});
