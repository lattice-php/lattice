import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button variants", () => {
  it("applies the success variant classes", () => {
    render(<Button variant="success">Save</Button>);

    expect(screen.getByRole("button")).toHaveClass("bg-lt-success", "text-lt-success-fg");
  });

  it("applies the info variant classes", () => {
    render(<Button variant="info">Details</Button>);

    expect(screen.getByRole("button")).toHaveClass("bg-lt-info", "text-lt-info-fg");
  });
});
