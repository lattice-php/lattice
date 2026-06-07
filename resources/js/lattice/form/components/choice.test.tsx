import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LatticeNode } from "@/lattice/core/types";
import { ChoiceComponent } from "./form-components";

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
    } satisfies LatticeNode<"form.choice">;

    window.addEventListener("lattice:appearance-change", handleChange);

    render(<ChoiceComponent node={node}>{null}</ChoiceComponent>);

    expect(screen.getByLabelText("Appearance")).toBeVisible();
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

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
