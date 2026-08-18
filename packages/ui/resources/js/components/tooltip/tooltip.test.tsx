import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("reveals arbitrary React content from the default info trigger", () => {
    render(<Tooltip content={<strong>Available on paid plans</strong>} />);

    fireEvent.click(screen.getByRole("button", { name: "More information" }));

    expect(screen.getByText("Available on paid plans")).toBeVisible();
  });

  it("reveals arbitrary React content from a custom trigger", () => {
    render(
      <Tooltip content={<a href="/releases">Release details</a>} trigger={<span>Beta</span>} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Beta" }));

    expect(screen.getByRole("link", { name: "Release details" })).toHaveAttribute(
      "href",
      "/releases",
    );
  });
});
