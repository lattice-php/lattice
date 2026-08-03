import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { Input } from "./input";

describe("ui package primitives", () => {
  it("renders controls without the umbrella package", () => {
    render(
      <>
        <Button>Save</Button>
        <Input aria-label="Name" />
      </>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  });
});
