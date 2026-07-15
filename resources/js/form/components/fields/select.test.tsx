import { act, configure, fireEvent, getConfig, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { SelectComponent } from "./select";

type MockOption = { label: string; value: string; data?: { color?: string } };

const { postFormAction } = vi.hoisted(() => ({
  postFormAction: vi.fn<
    (
      action: string,
      componentRef: string,
      body: Record<string, unknown>,
      signal: AbortSignal,
    ) => Promise<{ options?: MockOption[] }>
  >(() => Promise.resolve({ options: [] })),
}));

vi.mock("@lattice-php/lattice/form/lib/form-transport", () => ({
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
    type: "field.select",
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

    const row = { rowId: "r1", category: "chairs", product: "" };
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

function renderStaticSelect(props: Record<string, unknown>, initial: Record<string, unknown> = {}) {
  const node = fakeNode({
    type: "field.select",
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

describe("SelectComponent options", () => {
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

  it("omits the search box when not searchable", () => {
    renderStaticSelect({
      options: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    });

    fireEvent.click(screen.getByTestId("select-color"));

    expect(screen.queryByTestId("select-color-search")).not.toBeInTheDocument();
    expect(screen.getByTestId("select-color-option-red")).toBeVisible();
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

describe("SelectComponent creatable", () => {
  it("creates a free-text chip on Enter", () => {
    renderStaticSelect({ multiple: true, creatable: true, options: [] }, { color: [] });

    fireEvent.click(screen.getByTestId("select-color"));
    const input = screen.getByTestId("select-color-search");
    fireEvent.change(input, { target: { value: "steel" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("steel")).toBeVisible();
    expect(
      document.querySelector('input[type="hidden"][name="color[]"][value="steel"]'),
    ).not.toBeNull();
  });

  it("splits a comma-separated paste into multiple chips", () => {
    renderStaticSelect({ multiple: true, creatable: true, options: [] }, { color: [] });

    fireEvent.click(screen.getByTestId("select-color"));
    fireEvent.change(screen.getByTestId("select-color-search"), {
      target: { value: "a, b ,c" },
    });

    expect(screen.getByText("a")).toBeVisible();
    expect(screen.getByText("b")).toBeVisible();
    expect(screen.getByText("c")).toBeVisible();
  });

  it("does not add a duplicate chip", () => {
    renderStaticSelect({ multiple: true, creatable: true, options: [] }, { color: ["steel"] });

    fireEvent.click(screen.getByTestId("select-color"));
    const input = screen.getByTestId("select-color-search");
    fireEvent.change(input, { target: { value: "steel" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getAllByText("steel")).toHaveLength(1);
  });

  it("offers a create row for an unmatched query", () => {
    renderStaticSelect({ multiple: true, creatable: true, options: [] }, { color: [] });

    fireEvent.click(screen.getByTestId("select-color"));
    fireEvent.change(screen.getByTestId("select-color-search"), { target: { value: "steel" } });
    fireEvent.click(screen.getByTestId("select-color-create"));

    expect(screen.getByText("steel")).toBeVisible();
  });

  it("selects multiple exact-match options pasted in one comma-separated paste", () => {
    renderStaticSelect(
      {
        multiple: true,
        creatable: true,
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ],
      },
      { color: [] },
    );

    fireEvent.click(screen.getByTestId("select-color"));
    fireEvent.change(screen.getByTestId("select-color-search"), {
      target: { value: "Red,Blue" },
    });

    expect(
      document.querySelector('input[type="hidden"][name="color[]"][value="red"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('input[type="hidden"][name="color[]"][value="blue"]'),
    ).not.toBeNull();
  });

  it("replaces the value with a newly created label in a single-select", () => {
    renderStaticSelect(
      {
        creatable: true,
        options: [{ label: "Red", value: "red" }],
      },
      { color: "red" },
    );

    fireEvent.click(screen.getByTestId("select-color"));
    const input = screen.getByTestId("select-color-search");
    fireEvent.change(input, { target: { value: "steel" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.querySelector('input[type="hidden"][name="color"]')).toHaveValue("steel");
  });

  it("renders a color dot for an entity chip carrying data.color", () => {
    renderStaticSelect(
      {
        multiple: true,
        creatable: true,
        options: [{ label: "Urgent", value: "5", data: { color: "#ef4444" } }],
      },
      { color: ["5"] },
    );

    const chip = screen.getByText("Urgent").closest("span");
    expect(chip?.querySelector('[style*="rgb(239, 68, 68)"]')).not.toBeNull();
  });

  it("keeps an already-selected tag selected when re-entered instead of toggling it off", () => {
    renderStaticSelect(
      {
        multiple: true,
        creatable: true,
        options: [{ label: "Red", value: "red" }],
      },
      { color: ["red"] },
    );

    fireEvent.click(screen.getByTestId("select-color"));
    const input = screen.getByTestId("select-color-search");
    fireEvent.change(input, { target: { value: "Red" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getAllByTestId("select-color-remove-red")).toHaveLength(1);
    expect(
      document.querySelectorAll('input[type="hidden"][name="color[]"][value="red"]'),
    ).toHaveLength(1);
  });

  it("closes the popover after committing a tag in a single-select", () => {
    renderStaticSelect(
      { creatable: true, options: [{ label: "Red", value: "red" }] },
      { color: "" },
    );

    fireEvent.click(screen.getByTestId("select-color"));
    const input = screen.getByTestId("select-color-search");
    fireEvent.change(input, { target: { value: "Red" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.queryByTestId("select-color-search")).not.toBeInTheDocument();
  });

  it("keeps the popover open after committing a tag in a multiple select", () => {
    renderStaticSelect(
      { multiple: true, creatable: true, options: [{ label: "Red", value: "red" }] },
      { color: [] },
    );

    fireEvent.click(screen.getByTestId("select-color"));
    const input = screen.getByTestId("select-color-search");
    fireEvent.change(input, { target: { value: "Red" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByTestId("select-color-search")).toBeInTheDocument();
  });
});

describe("SelectComponent option schema", () => {
  const MetaText: RendererComponent = ({ node }) => <span>{String(node.props?.text ?? "")}</span>;

  it("materializes the option schema against each option's data", () => {
    const registry = createRegistry({
      components: { "test.meta": eagerComponent(MetaText) },
      name: "test",
    });

    const node = fakeNode({
      type: "field.select",
      props: {
        name: "customer",
        label: "Customer",
        emptyLabel: "No customers",
        searchPlaceholder: "Search",
        options: [
          { label: "Acme GmbH", value: "42", data: { email: "kontakt@acme.de" } },
          { label: "Globex AG", value: "43", data: { email: "info@globex.de" } },
        ],
      },
    });
    (node.props as { optionSchema?: Node[] }).optionSchema = [
      { type: "test.meta", props: { dataBindings: { text: "email" } } },
    ];

    renderWithRegistry(
      <FormProvider
        value={{
          action: "/forms/customers",
          clearErrors: () => {},
          componentRef: "ref-1",
          errors: {},
          fieldLabels: {},
          precognitive: false,
          processing: false,
          validate: () => {},
        }}
      >
        <FormValuesProvider initial={{}}>
          <SelectComponent node={node}>{null}</SelectComponent>
        </FormValuesProvider>
      </FormProvider>,
      registry,
    );

    fireEvent.click(screen.getByTestId("select-customer"));

    expect(screen.getByRole("option", { name: "Acme GmbH" })).toHaveTextContent("kontakt@acme.de");
    expect(screen.getByRole("option", { name: "Globex AG" })).toHaveTextContent("info@globex.de");
  });

  it("falls back to the plain label when the option schema is empty", () => {
    const node = fakeNode({
      type: "field.select",
      props: {
        name: "customer",
        label: "Customer",
        emptyLabel: "No customers",
        searchPlaceholder: "Search",
        options: [{ label: "Acme GmbH", value: "42", data: { email: "kontakt@acme.de" } }],
      },
    });
    (node.props as { optionSchema?: Node[] }).optionSchema = [];

    render(
      <FormProvider
        value={{
          action: "/forms/customers",
          clearErrors: () => {},
          componentRef: "ref-1",
          errors: {},
          fieldLabels: {},
          precognitive: false,
          processing: false,
          validate: () => {},
        }}
      >
        <FormValuesProvider initial={{}}>
          <SelectComponent node={node}>{null}</SelectComponent>
        </FormValuesProvider>
      </FormProvider>,
    );

    fireEvent.click(screen.getByTestId("select-customer"));

    expect(screen.getByRole("option", { name: "Acme GmbH" }).textContent).toBe("Acme GmbH");
  });
});
