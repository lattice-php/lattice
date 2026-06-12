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
    </div>
  );
}

it("derives scoped DOM name, error key, and row value", () => {
  render(
    <FieldScopeProvider base="items" index={2} row={{ name: "hi" }} onChange={() => {}}>
      <Probe />
    </FieldScopeProvider>,
  );

  expect(screen.getByTestId("dom").textContent).toBe("items[2][name]");
  expect(screen.getByTestId("err").textContent).toBe("items.2.name");
  expect(screen.getByTestId("val").textContent).toBe("hi");
});

it("returns null scope outside a provider", () => {
  render(<Probe />);
  expect(screen.getByTestId("dom").textContent).toBe("");
});
