import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Callout } from "./callout";

describe("Callout", () => {
  it("renders the title, message, and action slot as a status region", () => {
    render(
      <Callout
        variant="warning"
        title="Heads up"
        message="Trial ends soon"
        action={<a href="/billing">Upgrade</a>}
      />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("data-test", "callout-warning");
    expect(status).toHaveTextContent("Heads up");
    expect(status).toHaveTextContent("Trial ends soon");
    expect(screen.getByRole("link", { name: "Upgrade" })).toHaveAttribute("href", "/billing");
  });

  it("dismisses through the labelled button", () => {
    const onDismiss = vi.fn();

    render(<Callout variant="info" message="Saved." dismissLabel="Close" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("omits the dismiss button when not dismissible", () => {
    render(<Callout variant="danger" message="Read-only mode" dismissible={false} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("passes native div props through", () => {
    render(<Callout variant="success" message="Done" data-test="banner" />);

    expect(screen.getByRole("status")).toHaveAttribute("data-test", "banner");
  });
});
