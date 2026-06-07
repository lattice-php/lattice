import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconRenderer, IconRendererProvider } from "./icon-renderer";
import type { LatticeIconRenderer } from "./icon-renderer";

describe("Lattice icon renderer", () => {
  it("stacks custom renderers before parent renderers", () => {
    const fallbackRenderer = vi.fn<LatticeIconRenderer>(() => <span data-testid="fallback-icon" />);
    const customRenderer = vi.fn<LatticeIconRenderer>(() => null);

    render(
      <IconRendererProvider renderer={fallbackRenderer}>
        <IconRendererProvider renderer={customRenderer}>
          <IconRenderer icon="custom.spark" />
        </IconRendererProvider>
      </IconRendererProvider>,
    );

    expect(customRenderer).toHaveBeenCalledWith({
      className: undefined,
      icon: "custom.spark",
    });
    expect(fallbackRenderer).toHaveBeenCalledWith({
      className: undefined,
      icon: "custom.spark",
    });
    expect(screen.getByTestId("fallback-icon")).toBeVisible();
  });

  it("can replace parent renderers", () => {
    const fallbackRenderer = vi.fn<LatticeIconRenderer>(() => <span data-testid="fallback-icon" />);
    const customRenderer = vi.fn<LatticeIconRenderer>(() => <span data-testid="custom-icon" />);

    render(
      <IconRendererProvider renderer={fallbackRenderer}>
        <IconRendererProvider mode="replace" renderer={customRenderer}>
          <IconRenderer icon="custom.spark" />
        </IconRendererProvider>
      </IconRendererProvider>,
    );

    expect(customRenderer).toHaveBeenCalledTimes(1);
    expect(fallbackRenderer).not.toHaveBeenCalled();
    expect(screen.getByTestId("custom-icon")).toBeVisible();
  });
});
