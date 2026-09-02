import { describe, expect, it } from "vitest";
import { canRedo, canUndo, createHistory, push, redo, undo } from "./history";

describe("history", () => {
  it("coalesces rapid edits with the same key into one undo step", () => {
    let history = createHistory("a");
    history = push(history, "ab", { coalesceKey: "field", now: 1000 });
    history = push(history, "abc", { coalesceKey: "field", now: 1300 });
    history = push(history, "abcd", { coalesceKey: "field", now: 1500 });

    expect(history.past).toEqual(["a"]);
    expect(undo(history).present).toBe("a");
  });

  it("starts a new step after the window or for a different key", () => {
    let history = createHistory("a");
    history = push(history, "ab", { coalesceKey: "field", now: 1000 });
    history = push(history, "abc", { coalesceKey: "field", now: 2500 });
    history = push(history, "abcX", { coalesceKey: "other", now: 2600 });

    expect(history.past).toEqual(["a", "ab", "abc"]);
  });

  it("undo and redo walk the stack and a new push clears the future", () => {
    let history = push(push(createHistory(1), 2), 3);

    expect(canUndo(history)).toBe(true);
    history = undo(history);
    expect(history.present).toBe(2);
    expect(canRedo(history)).toBe(true);
    history = redo(history);
    expect(history.present).toBe(3);

    history = push(undo(history), 4);
    expect(history.future).toEqual([]);
    expect(undo(undo(history)).present).toBe(1);
    expect(undo(createHistory(1))).toEqual(createHistory(1));
  });

  it("ignores a push of the identical present", () => {
    const history = push(createHistory("a"), "b");

    expect(push(history, "b")).toBe(history);
  });
});
