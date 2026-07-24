import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { NativeSelect } from "./native-select";

describe("NativeSelect", () => {
  it("renders a styled native select with its options", () => {
    render(
      <NativeSelect aria-label="op" density="compact">
        <option value="a">A</option>
        <option value="b">B</option>
      </NativeSelect>,
    );

    const select = screen.getByRole("combobox", { name: "op" });
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveClass("text-sm");
    expect(screen.getByRole("option", { name: "A" })).toBeInTheDocument();
  });
});

describe("Button icon prop", () => {
  it("renders a leading icon glyph next to the label", () => {
    const { container } = render(<Button icon="save">Save</Button>);

    expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
