import { act, render, screen } from "@testing-library/react";
import { useLayoutEffect } from "@lattice-php/ui/lib/use-layout-effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FORM_DEBOUNCE_MS } from "@lattice-php/form/lib/form-transport";
import { builderNode } from "@lattice-php/form/test-support";
import { useFormResolver } from "./use-form-resolver";
import { FormValuesProvider, useFormValues, useSetFormValue } from "./values";

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
