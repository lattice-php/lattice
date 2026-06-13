import { expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { FormValuesProvider } from "../values";
import { ROW_ID_KEY } from "./repeater-rows";
import { useRowCollection } from "./use-row-collection";

function harness(onReady: (c: ReturnType<typeof useRowCollection>) => void) {
  function Probe() {
    onReady(useRowCollection("items", 0));
    return null;
  }
  return render(
    <FormValuesProvider initial={{ items: [{ a: "1" }, { a: "2" }] }}>
      <Probe />
    </FormValuesProvider>,
  );
}

it("assigns stable ids and preserves them across edit + reorder", () => {
  let c!: ReturnType<typeof useRowCollection>;
  harness((latest) => (c = latest));

  const id0 = c.rows[0][ROW_ID_KEY];
  const id1 = c.rows[1][ROW_ID_KEY];
  expect(id0).toBeTruthy();
  expect(id1).toBeTruthy();
  expect(id0).not.toBe(id1);

  act(() => c.onField(0, "a", "edited"));
  expect(c.rows[0][ROW_ID_KEY]).toBe(id0);
  expect(c.rows[1][ROW_ID_KEY]).toBe(id1);

  act(() => c.onMove(0, 1));
  expect(c.rows[1][ROW_ID_KEY]).toBe(id0);
  expect(c.rows[0][ROW_ID_KEY]).toBe(id1);
});

it("stamps an id on an appended row", () => {
  let c!: ReturnType<typeof useRowCollection>;
  harness((latest) => (c = latest));
  act(() => c.append({ a: "3" }));
  expect(c.rows[2][ROW_ID_KEY]).toBeTruthy();
});
