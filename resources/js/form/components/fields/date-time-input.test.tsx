import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { setTimezone } from "@lattice-php/lattice/i18n/timezone";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { DateTimeInputComponent } from "./date-time-input";

function renderField(node: Node<"field.date-time-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <DateTimeInputComponent node={node}>{null}</DateTimeInputComponent>
    </FormValuesProvider>,
  );
}

afterEach(() => {
  setTimezone("");
});

describe("DateTimeInputComponent", () => {
  it("renders an existing datetime in the active timezone", () => {
    setTimezone("Europe/Berlin");

    renderField(
      fakeNode({
        type: "field.date-time-input",
        props: { name: "starts_at", label: "Starts at" },
      }),
      { starts_at: "2026-06-19T14:30:00 Europe/Berlin" },
    );

    expect(document.querySelector('input[name="starts_at"]')).toHaveValue(
      "2026-06-19T14:30:00 Europe/Berlin",
    );
  });

  it("uses the configured timezone when committing a datetime", async () => {
    setTimezone("Europe/Berlin");

    renderField(
      fakeNode({
        type: "field.date-time-input",
        props: { name: "starts_at", label: "Starts at" },
      }),
      { starts_at: "2026-06-01T00:00:00 Europe/Berlin" },
    );

    fireEvent.click(screen.getByRole("button", { name: /open starts at calendar/i }));
    fireEvent.click(await screen.findByRole("button", { name: /19/i }));

    await waitFor(() => {
      expect(document.querySelector('input[name="starts_at"]')).toHaveValue(
        "2026-06-19T00:00:00 Europe/Berlin",
      );
    });

    fireEvent.change(screen.getByLabelText("Starts at time"), { target: { value: "14:30" } });

    await waitFor(() => {
      expect(document.querySelector('input[name="starts_at"]')).toHaveValue(
        "2026-06-19T14:30:00 Europe/Berlin",
      );
    });
  });
});
