import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Icon, IconRenderer, IconRendererProvider, SpriteProvider } from "@lattice/lattice";
import type { IconRendererFunction } from "@lattice/lattice";

describe("Lattice icon renderer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("renders icons as a sprite reference, forwarding the class name", () => {
    const { container } = render(
      <SpriteProvider sprite={{ href: "/build/sprite.svg", ids: ["edit"] }}>
        <IconRenderer className="text-lt-primary" icon="edit" />
      </SpriteProvider>,
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-4", "text-lt-primary");
    expect(svg?.querySelector("use")?.getAttribute("href")).toBe("/build/sprite.svg#edit");
  });

  it("optimistically references the sprite when ids are unknown", () => {
    const { container } = render(<IconRenderer icon="edit" />);

    expect(container.querySelector("use")?.getAttribute("href")).toBe("#edit");
    expect(container.querySelector("[data-lattice-missing-icon]")).toBeNull();
  });

  it("renders a missing icon fallback when the sprite lacks the icon", () => {
    vi.stubEnv("DEV", true);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const { container } = render(
      <SpriteProvider sprite={{ href: "", ids: [] }}>
        <IconRenderer icon="custom.spark-fallback" />
        <IconRenderer icon="custom.spark-fallback" />
      </SpriteProvider>,
    );

    expect(container.querySelectorAll("[data-lattice-missing-icon]")).toHaveLength(2);
    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(
      '[Lattice] Missing icon renderer for "custom.spark-fallback".',
    );
  });

  it("stacks custom renderers before the sprite", () => {
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

describe("Icon", () => {
  it("renders a sprite reference and forwards svg props", () => {
    const { container } = render(
      <SpriteProvider sprite={{ href: "/s.svg", ids: ["x"] }}>
        <Icon name="x" className="size-5" role="img" />
      </SpriteProvider>,
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-5");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg?.querySelector("use")?.getAttribute("href")).toBe("/s.svg#x");
  });

  it("injects the inline sprite source so same-document refs resolve", () => {
    const { container } = render(
      <SpriteProvider
        sprite={{ href: "", ids: ["house"], source: '<svg><symbol id="house"></symbol></svg>' }}
      >
        <Icon name="house" />
      </SpriteProvider>,
    );

    expect(container.querySelector("#house")).not.toBeNull();
    expect(container.querySelector("use")?.getAttribute("href")).toBe("#house");
  });
});
