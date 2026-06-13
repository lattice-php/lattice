import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FieldScopeProvider, useFieldScope } from "./field-scope";

function Probe() {
  const scope = useFieldScope();
  return (
    <div>
      <span data-testid="dom">{scope?.scopedName("name")}</span>
      <span data-testid="err">{scope?.errorKey("name")}</span>
      <span data-testid="val">{String(scope?.getValue("name"))}</span>
      <span data-testid="row-id">{String(scope?.rowId)}</span>
      <span data-testid="override">{scope?.overrideKey("price")}</span>
      <span data-testid="row-sku">{String(scope?.row.sku)}</span>
    </div>
  );
}

it("derives scoped DOM name, error key, and row value", () => {
  render(
    <FieldScopeProvider
      base="items"
      index={2}
      row={{ __rowId: "row-7", name: "hi", sku: "A-1" }}
      onChange={() => {}}
    >
      <Probe />
    </FieldScopeProvider>,
  );

  expect(screen.getByTestId("dom").textContent).toBe("items[2][name]");
  expect(screen.getByTestId("err").textContent).toBe("items.2.name");
  expect(screen.getByTestId("val").textContent).toBe("hi");
  expect(screen.getByTestId("row-id").textContent).toBe("row-7");
  expect(screen.getByTestId("override").textContent).toBe("items.row-7.price");
  expect(screen.getByTestId("row-sku").textContent).toBe("A-1");
});

it("returns null scope outside a provider", () => {
  render(<Probe />);
  expect(screen.getByTestId("dom").textContent).toBe("");
});
