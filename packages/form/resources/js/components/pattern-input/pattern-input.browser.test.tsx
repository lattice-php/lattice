import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { findNamedInput, formFrame } from "../../test-support";
import { PatternInputAdapter } from "./pattern-input-adapter";

function paddingField(): Node {
  return fakeNode({
    type: "field.choice",
    props: {
      name: "padding",
      label: "Padding",
      options: [
        { label: "4", value: "4", data: null },
        { label: "5", value: "5", data: null },
      ],
      value: "4",
    },
  });
}

function patternInputNode(extraProps: Record<string, unknown> = {}): Node<"field.pattern-input"> {
  return fakeNode({
    type: "field.pattern-input",
    props: {
      name: "pattern",
      label: "Pattern",
      separator: "",
      tokens: [
        { name: "NUMBER", label: "Number", schema: [paddingField()] },
        { name: "YYYY", label: "Year", schema: [] },
      ],
      ...extraProps,
    },
  });
}

function renderPatternInput(
  initial: Record<string, unknown> = {},
  extraProps: Record<string, unknown> = {},
) {
  return render(
    formFrame(
      <PatternInputAdapter node={patternInputNode(extraProps)}>{null}</PatternInputAdapter>,
      {
        initial,
      },
    ),
  );
}

describe("PatternInputAdapter in a browser", () => {
  it("inserts a token chip and hides it from the menu once placed", async () => {
    const screen = await renderPatternInput();

    await screen.getByTestId("pattern-input-insert-token").click();
    await page.getByTestId("pattern-input-insert-token-NUMBER").click();

    await expect.element(page.getByTestId("pattern-token-NUMBER")).toBeVisible();

    await screen.getByTestId("pattern-input-insert-token").click();
    await expect
      .element(page.getByTestId("pattern-input-insert-token-NUMBER"))
      .not.toBeInTheDocument();
    await expect.element(page.getByTestId("pattern-input-insert-token-YYYY")).toBeVisible();

    const input = await findNamedInput("pattern");
    await expect
      .poll(() => JSON.parse(input.value))
      .toEqual([{ type: "token", token: "NUMBER", config: { padding: "4" } }]);
  });

  it("renders a seeded pattern of text and a token, and keeps both after inserting another", async () => {
    const screen = await renderPatternInput({
      pattern: [
        { type: "text", value: "RE-" },
        { type: "token", token: "YYYY", config: {} },
      ],
    });

    await expect.element(page.getByText("RE-")).toBeVisible();
    await expect.element(page.getByTestId("pattern-token-YYYY")).toBeVisible();

    await screen.getByTestId("pattern-input-insert-token").click();
    await page.getByTestId("pattern-input-insert-token-NUMBER").click();

    const input = await findNamedInput("pattern");
    await expect.poll(() => (JSON.parse(input.value) as unknown[]).length).toBe(3);

    const segments = JSON.parse(input.value) as unknown[];

    expect(segments).toContainEqual({ type: "text", value: "RE-" });
    expect(segments).toContainEqual({ type: "token", token: "YYYY", config: {} });
    expect(segments).toContainEqual({ type: "token", token: "NUMBER", config: { padding: "4" } });
  });

  it("splits lines on enter in a multiline editor", async () => {
    const screen = await renderPatternInput({}, { multiline: true, rows: 3 });

    const editable = screen.container.querySelector('[contenteditable="true"]');
    expect(editable).not.toBeNull();
    await userEvent.click(editable as Element);
    await userEvent.keyboard("one{Enter}two");

    const input = await findNamedInput("pattern");
    await expect.poll(() => JSON.parse(input.value)).toEqual([{ type: "text", value: "one\ntwo" }]);
  });

  it("renders a seeded multiline value as paragraphs", async () => {
    const screen = await renderPatternInput(
      { pattern: [{ type: "text", value: "one\ntwo" }] },
      { multiline: true },
    );

    await expect.element(page.getByText("two")).toBeVisible();
    expect(screen.container.querySelectorAll('[contenteditable="true"] p')).toHaveLength(2);
  });

  it("keeps swallowing enter and strips seeded line breaks in a single-line editor", async () => {
    const screen = await renderPatternInput({ pattern: [{ type: "text", value: "one\ntwo" }] });

    expect(screen.container.querySelectorAll('[contenteditable="true"] p')).toHaveLength(1);

    const editable = screen.container.querySelector('[contenteditable="true"]');
    await userEvent.click(editable as Element);
    await userEvent.keyboard("{Enter}x");

    const input = await findNamedInput("pattern");
    await expect
      .poll(() =>
        (JSON.parse(input.value) as { value: string }[]).map((segment) => segment.value).join(""),
      )
      .not.toContain("\n");
  });

  it("changes a token's config through its popover", async () => {
    const screen = await renderPatternInput();

    await screen.getByTestId("pattern-input-insert-token").click();
    await page.getByTestId("pattern-input-insert-token-NUMBER").click();

    await screen.getByTestId("pattern-token-NUMBER-trigger").click();
    await page.getByLabelText("Padding").selectOptions("5");

    const input = await findNamedInput("pattern");
    await expect
      .poll(() => JSON.parse(input.value))
      .toEqual([{ type: "token", token: "NUMBER", config: { padding: "5" } }]);
  });
});
