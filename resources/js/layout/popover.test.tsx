import { vi } from "vitest";
vi.mock("@inertiajs/react", () => ({ usePage: () => ({ url: "/" }) }));

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover } from "./popover";

describe("Popover", () => {
  it("toggles its content and closes on outside click", () => {
    render(
      <Popover trigger={<span>Open</span>} testId="pop">
        <a href="/x">Item</a>
      </Popover>,
    );

    // The popover renders into document.body via a portal, so `screen` (which
    // queries the whole document) finds the portaled content; `data-test` is a
    // plain attribute so query it with document.querySelector (getByTestId looks
    // for data-testid, which lattice does not use).
    expect(screen.queryByRole("link", { name: "Item" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("link", { name: "Item" })).toBeVisible();

    const overlay = document.querySelector('[data-test="pop-overlay"]');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);
    expect(screen.queryByRole("link", { name: "Item" })).not.toBeInTheDocument();
  });

  it("opens upward for a top placement", () => {
    render(
      <Popover trigger={<span>Open</span>} placement="top" testId="pop">
        <a href="/x">Item</a>
      </Popover>,
    );

    fireEvent.click(screen.getByText("Open"));

    expect(screen.getByRole("menu").style.transform).toBe("translate(0, -100%)");
  });

  it("opens to the side without a transform for a right placement", () => {
    render(
      <Popover trigger={<span>Open</span>} placement="right" testId="pop">
        <a href="/x">Item</a>
      </Popover>,
    );

    fireEvent.click(screen.getByText("Open"));

    expect(screen.getByRole("menu").style.transform).toBe("");
  });
});
