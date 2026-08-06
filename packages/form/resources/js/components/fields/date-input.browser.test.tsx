import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import { DateInputComponent } from "./date-input";

describe("DateInputComponent in a browser", () => {
  it("commits a date picked from the calendar popover", async () => {
    const screen = await render(
      <FormValuesProvider initial={{ due: "2026-06-01" }}>
        <DateInputComponent
          node={fakeNode({ type: "field.date-input", props: { name: "due", label: "Due" } })}
        >
          {null}
        </DateInputComponent>
      </FormValuesProvider>,
    );

    await screen.getByRole("button", { name: "Open Due calendar" }).click();
    await screen.getByRole("button", { name: /19/ }).click();

    await expect
      .poll(() => document.querySelector<HTMLInputElement>('input[name="due"]')?.value)
      .toBe("2026-06-19");
  });
});
