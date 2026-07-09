import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("merges custom classes onto the pulsing surface", () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);

    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).not.toBeNull();
    expect(skeleton).toHaveClass("animate-pulse", "bg-lt-muted", "h-10", "w-full");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });
});
