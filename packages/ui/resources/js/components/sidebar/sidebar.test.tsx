import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCollapsed } from "@lattice-php/core/collapsed-context";
import { Sidebar } from "./sidebar";

function CollapsedProbe() {
  return <span data-test="probe">{useCollapsed() ? "collapsed" : "expanded"}</span>;
}

describe("Sidebar", () => {
  it("publishes the collapsed state to its children", () => {
    const { rerender } = render(
      <Sidebar>
        <CollapsedProbe />
      </Sidebar>,
    );

    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "false");
    expect(screen.getByText("expanded")).toBeInTheDocument();

    rerender(
      <Sidebar collapsed>
        <CollapsedProbe />
      </Sidebar>,
    );

    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "true");
    expect(screen.getByText("collapsed")).toBeInTheDocument();
  });

  it("closes the drawer from the backdrop and the Escape key", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Sidebar backdropProps={{ "data-test": "backdrop" }} onOpenChange={onOpenChange} open>
        Navigation
      </Sidebar>,
    );

    fireEvent.click(document.querySelector('[data-test="backdrop"]') as HTMLElement);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledTimes(2);

    rerender(
      <Sidebar backdropProps={{ "data-test": "backdrop" }} defaultOpen onOpenChange={onOpenChange}>
        Navigation
      </Sidebar>,
    );
    fireEvent.keyDown(window, { key: "Escape" });

    expect(document.querySelector('[data-test="backdrop"]')).toBeNull();
  });
});
