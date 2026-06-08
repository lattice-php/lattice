import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IconRenderer, IconRendererProvider } from "@lattice";
import type { IconRendererFunction } from "@lattice";

describe("Lattice icon renderer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("renders bundled default icons without a custom renderer", () => {
    const { container } = render(<IconRenderer className="text-lt-primary" icon="edit" />);

    expect(container.querySelector("svg")).toHaveClass("size-4", "text-lt-primary");
  });

  it("renders a missing icon fallback for unknown icons", () => {
    vi.stubEnv("DEV", true);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const { container } = render(
      <>
        <IconRenderer icon="custom.spark-fallback" />
        <IconRenderer icon="custom.spark-fallback" />
      </>,
    );

    expect(container.querySelectorAll("[data-lattice-missing-icon]")).toHaveLength(2);
    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(
      '[Lattice] Missing icon renderer for "custom.spark-fallback".',
    );
  });

  it("stacks custom renderers before parent renderers", () => {
    const fallbackRenderer = vi.fn<IconRendererFunction>(() => (
      <span data-testid="fallback-icon" />
    ));
    const customRenderer = vi.fn<IconRendererFunction>(() => null);

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
    const fallbackRenderer = vi.fn<IconRendererFunction>(() => (
      <span data-testid="fallback-icon" />
    ));
    const customRenderer = vi.fn<IconRendererFunction>(() => <span data-testid="custom-icon" />);

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
