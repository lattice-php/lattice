import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { setLocale } from "@lattice-php/ui/i18n/locale";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer, findNamedInput } from "../../test-support";
import { DateInputAdapter } from "./date-input-adapter";

const renderField = createFieldRenderer(DateInputAdapter);

afterEach(() => {
  setLocale("en");
});

describe("DateInputAdapter", () => {
  it("updates the visible date format when the locale changes", async () => {
    setLocale("en");

    renderField(fakeNode({ type: "field.date-input", props: { name: "due", label: "Due" } }), {
      due: "2026-06-19",
    });

    expect(await screen.findByLabelText("Due")).toHaveValue("06/19/2026");
    expect(await findNamedInput("due")).toHaveValue("2026-06-19");

    setLocale("de");

    await waitFor(() => {
      expect(screen.getByLabelText("Due")).toHaveValue("19.06.2026");
      expect(document.querySelector('input[type="hidden"][name="due"]')).toHaveValue("2026-06-19");
    });
  });

  it("normalizes compact dates typed into the picker input", async () => {
    renderField(fakeNode({ type: "field.date-input", props: { name: "due", label: "Due" } }));

    const input = await screen.findByLabelText("Due");

    fireEvent.input(input, { target: { value: "20260608" } });

    await waitFor(() => {
      expect(input).toHaveValue("06/08/2026");
      expect(document.querySelector('input[type="hidden"][name="due"]')).toHaveValue("2026-06-08");
    });
  });

  it("ignores incomplete and invalid compact dates typed into the picker input", async () => {
    renderField(fakeNode({ type: "field.date-input", props: { name: "due", label: "Due" } }));

    const input = await screen.findByLabelText("Due");
    const value = document.querySelector('input[type="hidden"][name="due"]');

    fireEvent.input(input, { target: { value: "202606" } });
    fireEvent.input(input, { target: { value: "20261340" } });

    expect(value).toHaveValue("");
  });
});
