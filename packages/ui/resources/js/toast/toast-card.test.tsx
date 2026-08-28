import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastCard } from "./toast-card";

describe("ToastCard", () => {
  it("renders statically without a Radix toast provider", () => {
    render(<ToastCard message="Quote saved." variant="success" />);

    expect(screen.getByText("Quote saved.")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders an action slot and reports dismissal", () => {
    const onDismiss = vi.fn();

    render(
      <ToastCard
        action={<button type="button">Undo</button>}
        dismissible
        message="Quote deleted."
        onDismiss={onDismiss}
        variant="danger"
      />,
    );

    expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
