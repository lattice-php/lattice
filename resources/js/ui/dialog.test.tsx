import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogHeader } from "./dialog";

describe("Dialog", () => {
  it("renders an overlay and a styled, titled panel", () => {
    render(
      <Dialog open>
        <DialogContent className="max-w-md">
          <DialogHeader closeLabel="Close" title="Settings" />
          <p>Body</p>
        </DialogContent>
      </Dialog>,
    );

    const content = screen.getByText("Body").closest('[data-slot="dialog-content"]');
    expect(content).not.toBeNull();
    expect(content).toHaveClass("bg-lt-bg", "max-w-md");
    expect(screen.getByText("Settings")).toBeVisible();
    expect(document.querySelector('[data-slot="dialog-overlay"]')).not.toBeNull();
    expect(screen.getByTestId("dialog-close")).toBe(screen.getByRole("button", { name: "Close" }));
  });

  it("renders the optional description in the header", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader title="Settings" description="Tune your preferences" />
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Tune your preferences")).toBeVisible();
  });

  it("defaults to the centered lg surface", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader closeLabel="Close" title="Settings" />
        </DialogContent>
      </Dialog>,
    );

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toHaveClass("left-1/2", "top-1/2", "max-w-lg", "rounded-lt", "w-full");
  });

  it("renders an end sheet docked to the trailing edge", () => {
    render(
      <Dialog open>
        <DialogContent placement="end" width="sm">
          <DialogHeader closeLabel="Close" title="Details" />
        </DialogContent>
      </Dialog>,
    );

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toHaveClass("inset-y-0", "end-0", "max-w-sm", "border-s");
    expect(content).not.toHaveClass("rounded-lt");
  });

  it("renders a start sheet docked to the leading edge", () => {
    render(
      <Dialog open>
        <DialogContent placement="start" width="3xl">
          <DialogHeader closeLabel="Close" title="Filters" />
        </DialogContent>
      </Dialog>,
    );

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toHaveClass("inset-y-0", "start-0", "max-w-3xl", "border-e");
  });
});
