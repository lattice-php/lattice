import { act, render, screen } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FORM_DEBOUNCE_MS } from "./form-transport";
import { useFormResolver } from "./use-form-resolver";
import { FormValuesProvider, useFormValues, useSetFormValue } from "./values";

function priceField(): Node {
  return fakeNode({
    type: "field.text-input",
    props: {
      name: "price",
      editablePrefill: true,
      prefillRefreshOn: ["@customer"],
      prefillResetOn: ["product"],
    },
  });
}

function builderNode(): Node {
  return {
    id: "builder",
    type: "field.builder",
    props: { name: "items" },
    templates: [{ type: "product", label: "Product", schema: [priceField()] }],
  } as unknown as Node;
}

function StampRowId() {
  const values = useFormValues();
  const setValue = useSetFormValue();

  useLayoutEffect(() => {
    const items = values.items;

    if (!Array.isArray(items) || items[0]?.rowId) {
      return;
    }

    setValue("items", [{ ...items[0], rowId: "r-stable" }]);
  }, [setValue, values]);

  return null;
}

function ResolverHarness() {
  useFormResolver("/resolve", "component-ref", [builderNode()]);
  const values = useFormValues();
  const items = Array.isArray(values.items) ? values.items : [];
  const price = items[0]?.price;

  return <output data-test="price">{String(price ?? "")}</output>;
}

describe("useFormResolver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps seeded row overrides after client row ids are attached", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ prefill: { "items.0.price": "999" } }), { status: 200 }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FormValuesProvider
        initial={{
          customer: "acme",
          items: [{ type: "product", product: "alpha", price: "1.00" }],
        }}
      >
        <ResolverHarness />
        <StampRowId />
      </FormValuesProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(FORM_DEBOUNCE_MS);
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(screen.getByTestId("price").textContent).toBe("1.00");
  });
});
