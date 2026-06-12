import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, getConfig, fireEvent, render, screen } from "@testing-library/react";

// The form convention is data-test; scope the RTL testIdAttribute to this file only.
let prevTestIdAttribute: string;
beforeAll(() => {
  prevTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});
afterAll(() => {
  configure({ testIdAttribute: prevTestIdAttribute });
});

// Mock the child-node renderer so the test doesn't need the full registry.
// The stub reads the FieldScope to prove each row scopes its children.
vi.mock("@lattice/lattice/core/renderer", async () => {
  const { useFieldScope } = await import("../field-scope");
  return {
    RenderNode: ({ node }: { node: { props: { name: string } } }) => {
      const scope = useFieldScope();
      return (
        <span data-test="child">{scope ? scope.scopedName(node.props.name) : "no-scope"}</span>
      );
    },
  };
});

import { FormProvider } from "../context";
import { FormValuesProvider } from "../values";
import { RepeaterComponent } from "./repeater";

const repeaterNode = {
  id: "r",
  type: "form.repeater",
  props: {
    name: "items",
    reorderable: true,
    defaultItems: 1,
    addLabel: "Add line",
    minItems: 0,
    maxItems: 3,
    label: "Line items",
  },
  schema: [{ id: "c", type: "form.text-input", props: { name: "name", label: "Name" } }],
} as never;

function wrap(ui: React.ReactNode, initial: Record<string, unknown> = {}) {
  return render(
    <FormProvider
      value={{
        action: "#",
        clearErrors: () => {},
        componentRef: "",
        errors: {},
        fieldLabels: {},
        precognitive: false,
        processing: false,
        validate: () => {},
      }}
    >
      <FormValuesProvider initial={initial}>{ui}</FormValuesProvider>
    </FormProvider>,
  );
}

it("renders defaultItems rows, each scoping its children", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>);
  const children = screen.getAllByTestId("child");
  expect(children).toHaveLength(1);
  expect(children[0].textContent).toBe("items[0][name]");
});

it("adds a row up to maxItems", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>);
  fireEvent.click(screen.getByTestId("repeater-items-add"));
  const children = screen.getAllByTestId("child");
  expect(children.map((c) => c.textContent)).toEqual(["items[0][name]", "items[1][name]"]);
});

it("removes a row", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>, {
    items: [{ name: "a" }, { name: "b" }],
  });
  expect(screen.getAllByTestId("child")).toHaveLength(2);
  fireEvent.click(screen.getByTestId("repeater-items-remove-0"));
  expect(screen.getAllByTestId("child")).toHaveLength(1);
});
