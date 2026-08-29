import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { createAction as fakeCreateAction } from "../../test-support";
import { QuickAdd } from "./quick-add";

describe("QuickAdd in a browser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("focuses the title input once expanded", async () => {
    const screen = await render(
      <QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={() => {}} />,
    );

    await screen.getByRole("button", { name: "Add card" }).click();

    const input = screen.getByPlaceholder("Enter a title...");
    await expect.poll(() => document.activeElement).toBe(input.element());
  });

  it("keeps focus on the input for a consecutive add after a successful submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ effects: [] }, { status: 200 })),
    );

    const screen = await render(
      <QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={() => {}} />,
    );

    await screen.getByRole("button", { name: "Add card" }).click();
    const input = screen.getByPlaceholder("Enter a title...");
    await userEvent.type(input, "Write spec{Enter}");

    await expect.element(input).toHaveValue("");
    await expect.poll(() => document.activeElement).toBe(input.element());
  });
});
