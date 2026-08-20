import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("PopoverContent", () => {
  it("portals content only once opened", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText("Body")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open"));

    expect(screen.getByText("Body")).toBeVisible();
  });
});
