import * as ToastPrimitive from "@radix-ui/react-toast";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast, type ToastProps } from "./toast";

function renderToast(props: Partial<ToastProps> = {}) {
  const onOpenChange = vi.fn();

  render(
    <ToastPrimitive.Provider duration={1000}>
      <Toast variant="success" message="Saved." onOpenChange={onOpenChange} {...props} />
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>,
  );

  return onOpenChange;
}

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the message, the variant marker, and the action slot", () => {
    renderToast({ action: <a href="/undo">Undo</a> });

    expect(screen.getByText("Saved.").closest("[data-test]")).toHaveAttribute(
      "data-test",
      "toast-success",
    );
    expect(screen.getByRole("link", { name: "Undo" })).toHaveAttribute("href", "/undo");
  });

  it("closes through the labelled dismiss button", () => {
    const onOpenChange = renderToast({ dismissLabel: "Close" });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("omits the dismiss button when not dismissible", () => {
    renderToast({ dismissible: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("closes itself after its duration", () => {
    const onOpenChange = renderToast({ duration: 500 });

    act(() => vi.advanceTimersByTime(600));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open when persistent regardless of the duration", () => {
    const onOpenChange = renderToast({ duration: 500, persistent: true });

    act(() => vi.advanceTimersByTime(10_000));

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
