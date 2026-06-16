import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FieldScopeProvider, useFieldScope } from "./field-scope";

function Probe() {
  const scope = useFieldScope();
  return (
    <div>
      <span data-test="dom">{scope?.scopedName("name")}</span>
      <span data-test="err">{scope?.errorKey("name")}</span>
      <span data-test="val">{String(scope?.getValue("name"))}</span>
      <span data-test="row-id">{String(scope?.rowId)}</span>
      <span data-test="override">{scope?.overrideKey("price")}</span>
      <span data-test="row-sku">{String(scope?.row.sku)}</span>
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

it("derives nested scoped DOM names and error keys from dot collection paths", () => {
  render(
    <FieldScopeProvider
      base="items.0.children"
      index={1}
      row={{ __rowId: "child-2", name: "nested", sku: "C-2" }}
      onChange={() => {}}
    >
      <Probe />
    </FieldScopeProvider>,
  );

  expect(screen.getByTestId("dom").textContent).toBe("items[0][children][1][name]");
  expect(screen.getByTestId("err").textContent).toBe("items.0.children.1.name");
  expect(screen.getByTestId("val").textContent).toBe("nested");
  expect(screen.getByTestId("override").textContent).toBe("items.0.children.child-2.price");
});

it("derives nested override keys from parent row ids", () => {
  render(
    <FieldScopeProvider
      base="sections"
      index={0}
      row={{ __rowId: "section-a", name: "section" }}
      onChange={() => {}}
    >
      <FieldScopeProvider
        base="sections.0.lines"
        index={0}
        row={{ __rowId: "line-a", name: "line" }}
        onChange={() => {}}
      >
        <Probe />
      </FieldScopeProvider>
    </FieldScopeProvider>,
  );

  expect(screen.getByTestId("dom").textContent).toBe("sections[0][lines][0][name]");
  expect(screen.getByTestId("err").textContent).toBe("sections.0.lines.0.name");
  expect(screen.getByTestId("override").textContent).toBe("sections.section-a.lines.line-a.price");
});

it("returns null scope outside a provider", () => {
  render(<Probe />);
  expect(screen.getByTestId("dom").textContent).toBe("");
});
