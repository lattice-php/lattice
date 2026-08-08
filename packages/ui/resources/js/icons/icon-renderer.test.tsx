import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Icon, IconRenderer, IconRendererProvider, SpriteProvider } from "./index";
import type { IconRendererFunction } from "./index";

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
    expect(svg).toHaveClass("size-lt-icon-md", "text-lt-primary");
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
    const fallbackRenderer = vi.fn<IconRendererFunction>(() => <span data-test="fallback-icon" />);
    const customRenderer = vi.fn<IconRendererFunction>(() => null);

    render(
      <IconRendererProvider renderer={fallbackRenderer}>
        <IconRendererProvider renderer={customRenderer}>
          <IconRenderer icon="custom.spark" />
        </IconRendererProvider>
      </IconRendererProvider>,
    );

    expect(screen.getByTestId("fallback-icon")).toBeVisible();
  });

  it("prefers the innermost renderer when it resolves the icon", () => {
    const fallbackRenderer = vi.fn<IconRendererFunction>(() => <span data-test="fallback-icon" />);
    const customRenderer = vi.fn<IconRendererFunction>(() => <span data-test="custom-icon" />);

    render(
      <IconRendererProvider renderer={fallbackRenderer}>
        <IconRendererProvider renderer={customRenderer}>
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
