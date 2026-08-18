import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("composes React content into an interactive header and body", () => {
    const onEdit = vi.fn();

    render(
      <Card
        title={<span>Plan</span>}
        description={<span>Monthly subscription</span>}
        tooltip={<a href="/billing">Billing details</a>}
        headerActions={<button onClick={onEdit}>Edit plan</button>}
      >
        <strong>Professional</strong>
      </Card>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit plan" }));
    expect(onEdit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByRole("link", { name: "Billing details" })).toHaveAttribute(
      "href",
      "/billing",
    );
    expect(screen.getByText("Professional")).toBeVisible();
  });
});
