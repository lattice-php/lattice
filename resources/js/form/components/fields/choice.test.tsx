import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "resources/js/core/types";
import { FormValuesProvider } from "../values";
import { ChoiceComponent } from "./choice";

describe("Lattice form choice component", () => {
  it("renders choices and dispatches change events", () => {
    const handleChange = vi.fn<(event: Event) => void>();
    const node = {
      props: {
        event: "lattice:appearance-change",
        label: "Appearance",
        name: "appearance",
        options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "System", value: "system" },
        ],
        value: "system",
      },
      type: "form.choice",
    } satisfies Node<"form.choice">;

    window.addEventListener("lattice:appearance-change", handleChange);

    render(
      <FormValuesProvider initial={{}}>
        <ChoiceComponent node={node}>{null}</ChoiceComponent>
      </FormValuesProvider>,
    );

    expect(screen.getByLabelText("Appearance")).toBeVisible();
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));

    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    expect(handleChange).toHaveBeenCalledTimes(1);
    const [[changeEvent]] = handleChange.mock.calls as [[CustomEvent]];

    expect(changeEvent.detail).toEqual({
      name: "appearance",
      value: "dark",
    });

    window.removeEventListener("lattice:appearance-change", handleChange);
  });
});
