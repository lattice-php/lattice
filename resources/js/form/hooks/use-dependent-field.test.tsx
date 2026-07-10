import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "./field-scope";
import { useDependentField } from "./use-dependent-field";
import { FormValuesProvider, useSetFormValue } from "./values";

function conditionNode(field: string, value: string): Node {
  return fakeNode({
    type: "field.text-input",
    props: {
      name: "discount",
      conditions: { visible: [{ field, operator: "eq", value }] },
    },
  });
}

function renderScopedField({
  global,
  node = conditionNode("product", "sku-1"),
  row,
}: {
  global: Record<string, unknown>;
  node?: Node;
  row?: Record<string, unknown>;
}) {
  const wrapper = ({ children }: { children: ReactNode }) => {
    const content = row ? (
      <FieldScopeProvider base="items" index={0} row={row} onChange={() => {}}>
        {children}
      </FieldScopeProvider>
    ) : (
      children
    );

    return <FormValuesProvider initial={global}>{content}</FormValuesProvider>;
  };

  return renderHook(() => useDependentField(node), { wrapper });
}

describe("useDependentField", () => {
  it("evaluates row conditions against same-row siblings", () => {
    const { result } = renderScopedField({
      global: { product: "global" },
      row: { rowId: "r1", product: "sku-1" },
    });

    expect(result.current.hidden).toBe(false);
  });

  it("lets row values shadow same-named global values", () => {
    const { result } = renderScopedField({
      global: { product: "sku-1" },
      row: { rowId: "r1", product: "other" },
    });

    expect(result.current.hidden).toBe(true);
  });

  it("falls back to form-level values from inside a row", () => {
    const { result } = renderScopedField({
      global: { customer: "vip" },
      node: conditionNode("customer", "vip"),
      row: { rowId: "r1" },
    });

    expect(result.current.hidden).toBe(false);
  });

  it("evaluates dotted condition fields against nested form values", () => {
    const { result } = renderScopedField({
      global: { address: { city: "Berlin" } },
      node: conditionNode(".address..city", "Berlin"),
    });

    expect(result.current.hidden).toBe(false);
  });

  it("falls back to ancestor row values from inside nested rows", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FormValuesProvider
        initial={{
          sections: [
            {
              rowId: "section-1",
              section: "office",
              items: [{ rowId: "item-1", product: "sku-1" }],
            },
          ],
        }}
      >
        <FieldScopeProvider
          base="sections"
          index={0}
          row={{ rowId: "section-1", section: "office" }}
          onChange={() => {}}
        >
          <FieldScopeProvider
            base="sections.0.items"
            index={0}
            row={{ rowId: "item-1", product: "sku-1" }}
            onChange={() => {}}
          >
            {children}
          </FieldScopeProvider>
        </FieldScopeProvider>
      </FormValuesProvider>
    );

    const { result } = renderHook(() => useDependentField(conditionNode("section", "office")), {
      wrapper,
    });

    expect(result.current.hidden).toBe(false);
  });

  it("does not rerender when unrelated form values change", () => {
    let renders = 0;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FormValuesProvider initial={{ product: "sku-1", unrelated: "A" }}>
        {children}
      </FormValuesProvider>
    );

    const { result } = renderHook(
      () => {
        renders++;

        return {
          state: useDependentField(conditionNode("product", "sku-1")),
          setValue: useSetFormValue(),
        };
      },
      { wrapper },
    );

    expect(result.current.state.hidden).toBe(false);
    expect(renders).toBe(1);

    act(() => result.current.setValue("unrelated", "B"));

    expect(renders).toBe(1);

    act(() => result.current.setValue("product", "other"));

    expect(result.current.state.hidden).toBe(true);
    expect(renders).toBe(2);
  });
});
