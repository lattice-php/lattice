import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { setLocale } from "@lattice-php/ui/i18n/locale";
import { setTimezone } from "@lattice-php/ui/i18n/timezone";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer, findNamedInput } from "@lattice-php/form/test-support";
import { DateTimeInputComponent } from "./date-time-input";

const renderField = createFieldRenderer(DateTimeInputComponent);

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
});
