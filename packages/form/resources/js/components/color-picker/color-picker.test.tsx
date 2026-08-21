import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker, normalizeHex } from "./color-picker";

describe("normalizeHex", () => {
  it("normalizes 6-digit hex with or without a hash", () => {
    expect(normalizeHex("#FF5733")).toBe("#ff5733");
    expect(normalizeHex("ff5733")).toBe("#ff5733");
  });

  it("expands 3-digit hex", () => {
    expect(normalizeHex("#f53")).toBe("#ff5533");
  });

  it("rejects invalid input", () => {
    expect(normalizeHex("not-a-color")).toBeNull();
    expect(normalizeHex("#ff573")).toBeNull();
    expect(normalizeHex("")).toBeNull();
  });
});

describe("ColorPicker", () => {
  it("fires onChange when a swatch is clicked", () => {
    const onChange = vi.fn<(hex: string) => void>();
    render(<ColorPicker onChange={onChange} palette={["#ef4444", "#3b82f6"]} value="" />);

    fireEvent.click(screen.getByRole("option", { name: "#ef4444" }));
    expect(onChange).toHaveBeenCalledWith("#ef4444");
  });

  it("marks the selected swatch", () => {
    render(<ColorPicker onChange={() => {}} palette={["#ef4444", "#3b82f6"]} value="#3b82f6" />);

    expect(screen.getByRole("option", { name: "#3b82f6" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "#ef4444" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("commits only valid hex from the text input", () => {
    const onChange = vi.fn<(hex: string) => void>();
    render(<ColorPicker onChange={onChange} palette={[]} value="#000000" />);

    const input = screen.getByLabelText("Hex color");
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "#FF5733" } });
    expect(onChange).toHaveBeenCalledWith("#ff5733");
  });

  it("snaps the text input back to the canonical value on blur", () => {
    render(<ColorPicker onChange={() => {}} palette={[]} value="#123456" />);

    const input = screen.getByLabelText("Hex color");
    fireEvent.change(input, { target: { value: "zz" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("#123456");
  });
});
