import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoTooltip } from "./info-tooltip";

describe("InfoTooltip", () => {
  it("renders nothing when content is empty", () => {
    const { container } = render(<InfoTooltip content={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("reveals trusted HTML content only after the trigger is clicked", () => {
    render(<InfoTooltip content={'See <a href="/docs">the docs</a>.'} />);

    expect(screen.queryByRole("link", { name: "the docs" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "More information" }));

    const link = screen.getByRole("link", { name: "the docs" });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", "/docs");
  });
});
