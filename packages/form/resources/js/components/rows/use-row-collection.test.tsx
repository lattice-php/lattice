import { expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { FieldScopeProvider } from "../../hooks/field-scope";
import {
  FormValuesProvider,
  useFormValue,
  useFormValues,
  useSetFormValue,
} from "../../hooks/values";
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

it("duplicates a row in place with a fresh id", () => {
  let c!: ReturnType<typeof useRowCollection>;
  harness((latest) => (c = latest));
  const id0 = c.rows[0][ROW_ID_KEY];

  act(() => c.onDuplicate(0));

  expect(c.rows).toHaveLength(3);
  expect(c.rows[1].a).toBe("1");
  expect(c.rows[1][ROW_ID_KEY]).not.toBe(id0);
  expect(c.rows[2].a).toBe("2");
});

it("reads and writes collections inside the current field scope", () => {
  let c!: ReturnType<typeof useRowCollection>;
  let latestValues!: Record<string, unknown>;

  function Probe() {
    c = useRowCollection("children", 0);
    latestValues = useFormValues();

    return null;
  }

  function ScopedProbe() {
    const setValue = useSetFormValue();
    const row = useFormValue("items.0") as Record<string, unknown>;

    return (
      <FieldScopeProvider
        base="items"
        index={0}
        row={row}
        onChange={(field, value) => setValue(`items.0.${field}`, value)}
      >
        <Probe />
      </FieldScopeProvider>
    );
  }

  render(
    <FormValuesProvider initial={{ items: [{ children: [{ name: "A" }] }] }}>
      <ScopedProbe />
    </FormValuesProvider>,
  );

  expect(c.rows[0].name).toBe("A");

  act(() => c.onField(0, "name", "B"));

  expect(latestValues).toEqual({
    items: [{ children: [{ name: "B", [ROW_ID_KEY]: c.rows[0][ROW_ID_KEY] }] }],
  });
});
