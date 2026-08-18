import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Collapsible } from "./collapsible";

describe("Collapsible", () => {
  beforeEach(() => window.localStorage.clear());

  it("restores and persists its open state when given a storage key", async () => {
    window.localStorage.setItem("profile", "true");

    const view = render(
      <Collapsible storageKey="profile" trigger="Profile">
        Profile fields
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Profile" });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Profile fields")).toBeVisible();

    fireEvent.click(trigger);

    await waitFor(() => expect(window.localStorage.getItem("profile")).toBe("false"));
    expect(screen.queryByText("Profile fields")).not.toBeInTheDocument();

    view.unmount();
    render(
      <Collapsible storageKey="profile" trigger="Profile">
        Profile fields
      </Collapsible>,
    );

    expect(screen.getByRole("button", { name: "Profile" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("reports requested changes without mutating controlled state", () => {
    const onOpenChange = vi.fn();

    render(
      <Collapsible open={false} onOpenChange={onOpenChange} trigger="Profile">
        Profile fields
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Profile" });

    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Profile fields")).not.toBeInTheDocument();
  });
});
