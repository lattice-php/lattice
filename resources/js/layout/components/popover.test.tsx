import { vi } from "vitest";
vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover } from "./popover";

describe("Popover", () => {
  it("opens its content when the trigger is clicked", () => {
    render(
      <Popover trigger={<span>Open</span>} testId="pop">
        <a href="/x">Item</a>
      </Popover>,
    );

    expect(screen.queryByRole("link", { name: "Item" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("pop"));

    expect(screen.getByRole("link", { name: "Item" })).toBeVisible();
  });

  it("renders its content as a menu", () => {
    render(
      <Popover trigger={<span>Open</span>} testId="pop">
        <a href="/x">Item</a>
      </Popover>,
    );

    fireEvent.click(screen.getByTestId("pop"));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes its content on Escape", () => {
    render(
      <Popover trigger={<span>Open</span>} testId="pop">
        <a href="/x">Item</a>
      </Popover>,
    );

    fireEvent.click(screen.getByTestId("pop"));
    expect(screen.getByRole("link", { name: "Item" })).toBeVisible();

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(screen.queryByRole("link", { name: "Item" })).not.toBeInTheDocument();
  });
});
