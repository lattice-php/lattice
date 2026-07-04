import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { setLocale } from "@lattice-php/lattice/i18n/locale";
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

async function findNamedInput(name: string): Promise<HTMLInputElement> {
  let input: HTMLInputElement | null = null;

  await waitFor(() => {
    input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);

    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  if (!input) {
    throw new Error(`Input ${name} was not rendered.`);
  }

  return input;
}

afterEach(() => {
  setLocale("en");
  setTimezone("");
});

describe("DateTimeInputComponent", () => {
  it("renders an existing datetime in the active timezone", async () => {
    setTimezone("Europe/Berlin");

    renderField(
      fakeNode({
        type: "field.date-time-input",
        props: { name: "starts_at", label: "Starts at" },
      }),
      { starts_at: "2026-06-19T14:30:00 Europe/Berlin" },
    );

    expect(await findNamedInput("starts_at")).toHaveValue("2026-06-19T14:30:00 Europe/Berlin");
  });

  it("shows a localized datetime without the submitted timezone suffix", async () => {
    setLocale("de");
    setTimezone("Europe/Berlin");

    renderField(
      fakeNode({
        type: "field.date-time-input",
        props: { name: "starts_at", label: "Starts at" },
      }),
      { starts_at: "2026-06-19T14:30:00 Europe/Berlin" },
    );

    expect(await screen.findByLabelText("Starts at")).toHaveValue("19.06.2026, 14:30");
    expect(await findNamedInput("starts_at")).toHaveValue("2026-06-19T14:30:00 Europe/Berlin");
  });

  it("does not compact-normalize datetime text input", async () => {
    setTimezone("Europe/Berlin");

    renderField(
      fakeNode({
        type: "field.date-time-input",
        props: { name: "starts_at", label: "Starts at" },
      }),
      { starts_at: "2026-06-19T14:30:00 Europe/Berlin" },
    );

    fireEvent.input(await screen.findByLabelText("Starts at"), { target: { value: "20260608" } });

    expect(await findNamedInput("starts_at")).toHaveValue("2026-06-19T14:30:00 Europe/Berlin");
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

    fireEvent.click(await screen.findByRole("button", { name: /open starts at calendar/i }));
    fireEvent.click(await screen.findByRole("button", { name: /19/i }));

    await waitFor(() => {
      expect(document.querySelector('input[name="starts_at"]')).toHaveValue(
        "2026-06-19T00:00:00 Europe/Berlin",
      );
    });

    fireEvent.click(screen.getByRole("option", { name: "Hour 14" }));

    await waitFor(() => {
      expect(document.querySelector('input[name="starts_at"]')).toHaveValue(
        "2026-06-19T14:00:00 Europe/Berlin",
      );
    });

    fireEvent.click(screen.getByRole("option", { name: "Minute 30" }));

    await waitFor(() => {
      expect(document.querySelector('input[name="starts_at"]')).toHaveValue(
        "2026-06-19T14:30:00 Europe/Berlin",
      );
    });
  });

  it("renders the time picker columns inside the datetime picker", async () => {
    setTimezone("Europe/Berlin");

    renderField(
      fakeNode({
        type: "field.date-time-input",
        props: { name: "starts_at", label: "Starts at" },
      }),
      { starts_at: "2026-06-19T01:01:00 Europe/Berlin" },
    );

    fireEvent.click(await screen.findByRole("button", { name: /open starts at calendar/i }));

    expect(await screen.findByRole("option", { name: "Hour 01" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Minute 01" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Starts at time")).not.toBeInTheDocument();
  });
});
