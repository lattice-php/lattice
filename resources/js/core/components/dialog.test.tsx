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
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
