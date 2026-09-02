import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

function overlay(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]');

  if (!element) {
    throw new Error("dialog overlay not rendered");
  }

  return element;
}

function content(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-slot="dialog-content"]');

  if (!element) {
    throw new Error("dialog content not rendered");
  }

  return element;
}

describe("Dialog in a browser", () => {
  it("centers a short dialog without scrolling", async () => {
    const screen = await render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Short</DialogTitle>
          <p>One line</p>
        </DialogContent>
      </Dialog>,
    );

    await expect.element(screen.getByText("One line")).toBeVisible();

    const box = content().getBoundingClientRect();
    expect(overlay().scrollHeight).toBe(overlay().clientHeight);
    expect(Math.abs(box.top + box.height / 2 - window.innerHeight / 2)).toBeLessThan(2);
  });

  it("grows a tall dialog past the viewport and scrolls the overlay instead of the panel", async () => {
    const screen = await render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Tall</DialogTitle>
          <div style={{ height: 3000 }}>Tall body</div>
        </DialogContent>
      </Dialog>,
    );

    await expect.element(screen.getByText("Tall body")).toBeInTheDocument();

    expect(content().getBoundingClientRect().height).toBeGreaterThan(3000);
    expect(content().scrollHeight).toBe(content().clientHeight);
    expect(overlay().scrollHeight).toBeGreaterThan(overlay().clientHeight);

    overlay().scrollTop = overlay().scrollHeight;
    expect(overlay().scrollTop).toBeGreaterThan(0);
  });

  it("caps a dialog at the requested height and scrolls inside it", async () => {
    const screen = await render(
      <Dialog open>
        <DialogContent aria-describedby={undefined} height="sm">
          <DialogTitle>Capped</DialogTitle>
          <div style={{ height: 3000 }}>Capped body</div>
        </DialogContent>
      </Dialog>,
    );

    await expect.element(screen.getByText("Capped body")).toBeInTheDocument();

    expect(content().getBoundingClientRect().height).toBeLessThanOrEqual(480);
    expect(content().scrollHeight).toBeGreaterThan(content().clientHeight);
    expect(overlay().scrollHeight).toBe(overlay().clientHeight);
  });
});
