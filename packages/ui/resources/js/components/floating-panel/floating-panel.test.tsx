import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FloatingPanel } from "./floating-panel";

describe("FloatingPanel", () => {
  it("toggles its body from arbitrary React trigger content", () => {
    render(
      <FloatingPanel trigger={<span>Chat</span>}>
        <section>Conversation</section>
      </FloatingPanel>,
    );

    const trigger = screen.getByRole("button", { name: "Chat" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled open state", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <FloatingPanel onOpenChange={onOpenChange} open={false} trigger="Chat">
        Conversation
      </FloatingPanel>,
    );
    const trigger = screen.getByRole("button", { name: "Chat" });

    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    rerender(
      <FloatingPanel onOpenChange={onOpenChange} open trigger="Chat">
        Conversation
      </FloatingPanel>,
    );

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
