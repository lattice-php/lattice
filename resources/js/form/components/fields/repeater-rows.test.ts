import { expect, it } from "vitest";
import { addRow, moveRow, removeRow, seedRows } from "./repeater-rows";

it("seeds rows from an existing value", () => {
  expect(seedRows([{ name: "a" }], 3)).toEqual([{ name: "a" }]);
});

it("seeds defaultItems blanks when value is empty or missing", () => {
  expect(seedRows(undefined, 2)).toEqual([{}, {}]);
  expect(seedRows([], 2)).toEqual([{}, {}]);
  expect(seedRows(null, 1)).toEqual([{}]);
});

it("seeds zero rows when defaultItems is 0 and no value", () => {
  expect(seedRows(undefined, 0)).toEqual([]);
});

it("copies seeded rows (no shared reference with the input)", () => {
  const input = [{ name: "a" }];
  const seeded = seedRows(input, 1);
  expect(seeded[0]).not.toBe(input[0]);
  expect(seeded[0]).toEqual({ name: "a" });
});

it("adds a blank row", () => {
  expect(addRow([{ name: "a" }])).toEqual([{ name: "a" }, {}]);
});

it("removes a row by index", () => {
  expect(removeRow([{ n: 0 }, { n: 1 }, { n: 2 }], 1)).toEqual([{ n: 0 }, { n: 2 }]);
});

it("moves a row from one index to another", () => {
  expect(moveRow([{ n: 0 }, { n: 1 }, { n: 2 }], 0, 2)).toEqual([{ n: 1 }, { n: 2 }, { n: 0 }]);
  expect(moveRow([{ n: 0 }, { n: 1 }, { n: 2 }], 2, 0)).toEqual([{ n: 2 }, { n: 0 }, { n: 1 }]);
});

it("does not mutate the input array", () => {
  const rows = [{ n: 0 }, { n: 1 }];
  addRow(rows);
  removeRow(rows, 0);
  moveRow(rows, 0, 1);
  expect(rows).toEqual([{ n: 0 }, { n: 1 }]);
});
