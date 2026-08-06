import { render } from "vitest-browser-react";
import { afterEach, describe, expect, it } from "vitest";
import { setTimezone } from "@lattice-php/ui/i18n/timezone";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import { DateTimeInputComponent } from "./date-time-input";

function renderStartsAt(value: string) {
  return render(
    <FormValuesProvider initial={{ starts_at: value }}>
      <DateTimeInputComponent
        node={fakeNode({
          type: "field.date-time-input",
          props: { name: "starts_at", label: "Starts at" },
        })}
      >
        {null}
      </DateTimeInputComponent>
    </FormValuesProvider>,
  );
}

function submittedValue(): string | undefined {
  return document.querySelector<HTMLInputElement>('input[name="starts_at"]')?.value;
}

afterEach(() => {
  setTimezone("");
});

describe("DateTimeInputComponent in a browser", () => {
  it("uses the configured timezone when committing a datetime from the popover", async () => {
    setTimezone("Europe/Berlin");

    const screen = await renderStartsAt("2026-06-01T00:00:00 Europe/Berlin");

    await screen.getByRole("button", { name: "Open Starts at calendar" }).click();
    await screen.getByRole("button", { name: /19/ }).click();

    await expect.poll(submittedValue).toBe("2026-06-19T00:00:00 Europe/Berlin");

    await screen.getByRole("option", { name: "Hour 14" }).click();

    await expect.poll(submittedValue).toBe("2026-06-19T14:00:00 Europe/Berlin");

    await screen.getByRole("option", { name: "Minute 30" }).click();

    await expect.poll(submittedValue).toBe("2026-06-19T14:30:00 Europe/Berlin");
  });

  it("renders the time picker columns inside the datetime picker", async () => {
    setTimezone("Europe/Berlin");

    const screen = await renderStartsAt("2026-06-19T01:01:00 Europe/Berlin");

    await screen.getByRole("button", { name: "Open Starts at calendar" }).click();

    await expect
      .element(screen.getByRole("option", { name: "Hour 01" }))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(screen.getByRole("option", { name: "Minute 01" })).toBeInTheDocument();
    await expect.element(screen.getByLabelText("Starts at time")).not.toBeInTheDocument();
  });
});
