import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFieldRenderer, fakeConditions, fakeNode } from "@lattice-php/lattice/test-support";
import { TextInputComponent } from "./text-input";

const renderField = createFieldRenderer(TextInputComponent);

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  vi.restoreAllMocks();
});

describe("TextInputComponent conditions", () => {
  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "company",
          label: "Company",
          conditions: fakeConditions({
            visible: [{ field: "type", operator: "eq", value: "business" }],
          }),
        },
      }),
      { type: "personal" },
    );

    expect(screen.queryByRole("textbox", { name: "Company" })).not.toBeInTheDocument();
  });

  it("shows when its visible condition matches", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "company",
          label: "Company",
          conditions: fakeConditions({
            visible: [{ field: "type", operator: "eq", value: "business" }],
          }),
        },
      }),
      { type: "business" },
    );

    expect(screen.getByRole("textbox", { name: "Company" })).toBeVisible();
  });

  it("renders helper text beneath the field", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "price", label: "Price", helperText: "Shown to buyers." },
      }),
    );

    expect(screen.getByText("Shown to buyers.")).toBeVisible();
  });
});

describe("TextInputComponent affixes", () => {
  it("renders a text prefix and suffix around the input", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "price",
          label: "Price",
          prefix: { icon: null, text: "$" },
          suffix: { icon: null, text: "USD" },
        },
      }),
    );

    expect(screen.getByText("$")).toBeVisible();
    expect(screen.getByText("USD")).toBeVisible();
  });

  it("squares the input corners adjacent to each affix", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "price",
          label: "Price",
          prefix: { icon: null, text: "$" },
          suffix: { icon: null, text: "USD" },
        },
      }),
    );

    const input = screen.getByRole("textbox", { name: "Price" });
    expect(input).toHaveClass("rounded-l-none", "rounded-r-none");
  });

  it("renders an icon affix as an icon, not literal text", () => {
    const { container } = renderField(
      fakeNode({
        type: "field.text-input",
        props: {
          name: "search",
          label: "Search",
          prefix: { icon: "search", text: null },
        },
      }),
    );

    expect(container.querySelector('[data-slot="affix-start"] svg')).not.toBeNull();
  });

  it("draws the focus ring around the whole group and suppresses the bare input ring", () => {
    const { container } = renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "price", label: "Price", prefix: { icon: null, text: "$" } },
      }),
    );

    const group = container.querySelector('[data-slot="affix-group"]');
    expect(group?.className).toContain("has-[:focus-visible]:ring-[3px]");
    expect(screen.getByRole("textbox", { name: "Price" })).toHaveClass("focus-visible:ring-0");
  });

  it("leaves the input unwrapped when there are no affixes", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "plain", label: "Plain" },
      }),
    );

    const input = screen.getByRole("textbox", { name: "Plain" });
    expect(input).not.toHaveClass("rounded-l-none", "rounded-r-none");
  });
});

describe("TextInputComponent copy affix", () => {
  it("renders no copy button by default", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "plain", label: "Plain" },
      }),
    );

    expect(screen.queryByRole("button", { name: /Copy/ })).not.toBeInTheDocument();
  });

  it("copies the current input value", () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "api_key", label: "API key", copyable: true },
      }),
    );

    fireEvent.change(screen.getByRole("textbox", { name: "API key" }), {
      target: { value: "tok_secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Copy API key" }));

    expect(writeText).toHaveBeenCalledWith("tok_secret");
    expect(screen.getByRole("button", { name: "Copied API key" })).toBeInTheDocument();
  });

  it("squares the input corner adjacent to the copy button", () => {
    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "api_key", label: "API key", copyable: true },
      }),
    );

    expect(screen.getByRole("textbox", { name: "API key" })).toHaveClass("rounded-r-none");
  });
});
