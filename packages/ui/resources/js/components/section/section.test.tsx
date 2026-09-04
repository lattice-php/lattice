import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Section } from "./section";

describe("Section", () => {
  it("collapses and expands its content", () => {
    render(
      <Section collapsible title="Advanced">
        Hidden body
      </Section>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse section" }));
    expect(screen.getByText("Hidden body")).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Expand section" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand section" }));
    expect(screen.getByText("Hidden body")).toBeVisible();
    expect(screen.getByRole("button", { name: "Collapse section" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("reveals the title tooltip", () => {
    render(<Section title="Members" tooltip="People with access." />);

    fireEvent.click(screen.getByRole("button", { name: "More information" }));

    expect(screen.getByText("People with access.")).toBeVisible();
  });

  it("supports controlled collapsed state", () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(
      <Section collapsed={false} collapsible onCollapsedChange={onCollapsedChange} title="Advanced">
        Hidden body
      </Section>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse section" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("Hidden body")).toBeVisible();

    rerender(
      <Section collapsed collapsible onCollapsedChange={onCollapsedChange} title="Advanced">
        Hidden body
      </Section>,
    );

    expect(screen.getByText("Hidden body")).not.toBeVisible();
  });
});
