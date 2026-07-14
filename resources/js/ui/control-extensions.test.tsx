import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { Input } from "./input";
import { NativeSelect } from "./native-select";

describe("Input density", () => {
  it("wears compact chrome when asked and comfortable by default", () => {
    const { rerender } = render(<Input aria-label="q" density="compact" />);
    expect(screen.getByLabelText("q")).toHaveClass("text-sm");

    rerender(<Input aria-label="q" />);
    expect(screen.getByLabelText("q")).toHaveClass("text-base");
  });
});

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
