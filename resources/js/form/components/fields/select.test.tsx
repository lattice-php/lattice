import { act, configure, fireEvent, getConfig, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice/lattice/test-support";
import { FormProvider } from "../context";
import { FieldScopeProvider } from "../field-scope";
import { FormValuesProvider } from "../values";
import { SelectComponent } from "./select";

const { postFormAction } = vi.hoisted(() => ({
  postFormAction: vi.fn<
    (
      action: string,
      componentRef: string,
      body: Record<string, unknown>,
      signal: AbortSignal,
    ) => Promise<{ options: [] }>
  >(() => Promise.resolve({ options: [] })),
}));

vi.mock("../form-transport", () => ({
  FORM_DEBOUNCE_MS: 250,
  postFormAction,
}));

let previousTestIdAttribute: string;

beforeAll(() => {
  previousTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});

afterAll(() => {
  configure({ testIdAttribute: previousTestIdAttribute });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

function renderSelect({
  initial,
  row,
}: {
  initial: Record<string, unknown>;
  row?: Record<string, unknown>;
}) {
  const node = fakeNode({
    type: "form.select",
    props: {
      name: "product",
      label: "Product",
      searchable: true,
      options: [],
      emptyLabel: "No products",
      searchPlaceholder: "Search products",
    },
  });

  const select = <SelectComponent node={node}>{null}</SelectComponent>;
  const scoped = row ? (
    <FieldScopeProvider base="items" index={0} row={row} onChange={() => {}}>
      {select}
    </FieldScopeProvider>
  ) : (
    select
  );

  return render(
    <FormProvider
      value={{
        action: "/forms/products",
        clearErrors: () => {},
        componentRef: "ref-1",
        errors: {},
        fieldLabels: {},
        precognitive: false,
        processing: false,
        validate: () => {},
      }}
    >
      <FormValuesProvider initial={initial}>{scoped}</FormValuesProvider>
    </FormProvider>,
  );
}

async function search(query: string): Promise<void> {
  fireEvent.click(screen.getByTestId("select-product"));
  fireEvent.change(screen.getByTestId("select-product-search"), {
    target: { value: query },
  });

  await act(async () => {
    vi.advanceTimersByTime(250);
    await Promise.resolve();
  });
}

describe("SelectComponent search", () => {
  it("posts a row search path with current form values inside a row", async () => {
    vi.useFakeTimers();

    const row = { __rowId: "r1", category: "chairs", product: "" };
    const initial = { customer: "acme", items: [row] };

    renderSelect({ initial, row });

    await search("desk");

    expect(postFormAction).toHaveBeenCalledWith(
      "/forms/products",
      "ref-1",
      { _search: "items.0.product", q: "desk", ...initial },
      expect.any(AbortSignal),
    );
  });
});
