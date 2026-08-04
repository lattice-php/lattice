import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("PopoverContent", () => {
  it("portals styled content only once opened", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="w-80">Body</PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText("Body")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open"));

    const content = screen.getByText("Body");
    expect(content).toBeVisible();
    expect(content).toHaveClass("bg-lt-popover", "border", "w-80");
  });
});
