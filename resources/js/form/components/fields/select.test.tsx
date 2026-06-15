import { act, configure, fireEvent, getConfig, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
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
    ) => Promise<{ options: { label: string; value: string }[] }>
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

  it("loads on open, fetches matches, and selects a searched option", async () => {
    vi.useFakeTimers();
    postFormAction.mockResolvedValue({ options: [{ label: "Desk", value: "desk" }] });

    renderSelect({ initial: {} });

    fireEvent.click(screen.getByTestId("select-product"));

    // Opening fires an empty search that clears results without a request.
    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });
    expect(postFormAction).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId("select-product-search"), { target: { value: "de" } });
    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByTestId("select-product-option-desk"));

    expect(screen.getByTestId("select-product")).toHaveTextContent("Desk");
  });
});

describe("SelectComponent options", () => {
  function renderStaticSelect(
    props: Record<string, unknown>,
    initial: Record<string, unknown> = {},
  ) {
    const node = fakeNode({
      type: "form.select",
      props: {
        name: "color",
        label: "Color",
        emptyLabel: "No colors",
        searchPlaceholder: "Search",
        ...props,
      },
    });

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
        <FormValuesProvider initial={initial}>
          <SelectComponent node={node}>{null}</SelectComponent>
        </FormValuesProvider>
      </FormProvider>,
    );
  }

  it("lists static options and selects one", () => {
    renderStaticSelect({
      options: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    });

    fireEvent.click(screen.getByTestId("select-color"));
    fireEvent.click(screen.getByTestId("select-color-option-blue"));

    expect(screen.getByTestId("select-color")).toHaveTextContent("Blue");
  });

  it("shows chips and removes a value in a multiple select", () => {
    renderStaticSelect(
      {
        multiple: true,
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ],
      },
      { color: ["red"] },
    );

    expect(screen.getByText("Red")).toBeVisible();

    fireEvent.click(screen.getByTestId("select-color-remove-red"));

    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("toggles options without closing in a multiple select", () => {
    renderStaticSelect({
      multiple: true,
      options: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    });

    fireEvent.click(screen.getByTestId("select-color"));
    fireEvent.click(screen.getByTestId("select-color-option-red"));

    // The popover stays open for multi-select, so the second option is clickable.
    fireEvent.click(screen.getByTestId("select-color-option-blue"));

    expect(screen.getByTestId("select-color-option-red")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("select-color-option-blue")).toHaveAttribute("aria-selected", "true");
  });
});
