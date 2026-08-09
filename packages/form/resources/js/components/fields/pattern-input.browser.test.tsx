import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { findNamedInput, formFrame } from "@lattice-php/form/test-support";
import { PatternInputComponent } from "./pattern-input";

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

function patternInputNode(): Node<"field.pattern-input"> {
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
    },
  });
}

function renderPatternInput(initial: Record<string, unknown> = {}) {
  return render(
    formFrame(<PatternInputComponent node={patternInputNode()}>{null}</PatternInputComponent>, {
      initial,
    }),
  );
}

describe("PatternInputComponent in a browser", () => {
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
