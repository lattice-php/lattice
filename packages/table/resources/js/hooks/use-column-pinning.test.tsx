import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { type PinnableColumn, useColumnPinning } from "./use-column-pinning";

const columns: PinnableColumn[] = [
  { key: "name", props: {} },
  { key: "email", props: { pinned: "left" } },
  { key: "total", props: { pinned: "right" } },
];

function Harness({ storageKey }: { storageKey?: string }) {
  const { hasPinOverrides, pinFor, resetPins, setColumnPin } = useColumnPinning({
    columns,
    storageKey,
  });

  return (
    <div>
      <span data-test="pins">
        {columns.map((column) => `${column.key}:${pinFor(column) ?? "none"}`).join(",")}
      </span>
      <span data-test="has-overrides">{String(hasPinOverrides)}</span>
      <button data-test="pin-name-left" onClick={() => setColumnPin("name", "left")} type="button">
        pin name left
      </button>
      <button data-test="unpin-email" onClick={() => setColumnPin("email", null)} type="button">
        unpin email
      </button>
      <button
        data-test="re-pin-email-left"
        onClick={() => setColumnPin("email", "left")}
        type="button"
      >
        re-pin email left
      </button>
      <button data-test="reset" onClick={resetPins} type="button">
        reset
      </button>
    </div>
  );
}

describe("useColumnPinning", () => {
  beforeEach(() => window.localStorage.clear());

  it("falls back to the server default pin for columns without an override", () => {
    render(<Harness />);
    expect(screen.getByTestId("pins")).toHaveTextContent("name:none,email:left,total:right");
    expect(screen.getByTestId("has-overrides")).toHaveTextContent("false");
  });

  it("pins a column on override and persists it", () => {
    render(<Harness storageKey="pins" />);
    fireEvent.click(screen.getByTestId("pin-name-left"));
    expect(screen.getByTestId("pins")).toHaveTextContent("name:left,email:left,total:right");
    expect(JSON.parse(window.localStorage.getItem("pins") ?? "")).toEqual({
      overrides: { name: "left" },
    });
  });

  it("stores an explicit unpin for a server-pinned column as false", () => {
    render(<Harness storageKey="pins" />);
    fireEvent.click(screen.getByTestId("unpin-email"));
    expect(screen.getByTestId("pins")).toHaveTextContent("name:none,email:none,total:right");
    expect(JSON.parse(window.localStorage.getItem("pins") ?? "")).toEqual({
      overrides: { email: false },
    });
  });

  it("drops the override once it matches the server default again", () => {
    render(<Harness storageKey="pins" />);
    fireEvent.click(screen.getByTestId("unpin-email"));
    fireEvent.click(screen.getByTestId("re-pin-email-left"));
    expect(screen.getByTestId("pins")).toHaveTextContent("name:none,email:left,total:right");
    expect(window.localStorage.getItem("pins")).toBeNull();
  });

  it("restores server defaults on reset", () => {
    render(<Harness storageKey="pins" />);
    fireEvent.click(screen.getByTestId("pin-name-left"));
    fireEvent.click(screen.getByTestId("reset"));
    expect(screen.getByTestId("pins")).toHaveTextContent("name:none,email:left,total:right");
    expect(window.localStorage.getItem("pins")).toBeNull();
  });

  it("loads persisted overrides and ignores unknown keys and invalid values", () => {
    window.localStorage.setItem(
      "pins",
      JSON.stringify({ overrides: { name: "left", ghost: "left", total: "sideways" } }),
    );
    render(<Harness storageKey="pins" />);
    expect(screen.getByTestId("pins")).toHaveTextContent("name:left,email:left,total:right");
  });

  it("discards malformed stored data", () => {
    window.localStorage.setItem("pins", "not-json");
    render(<Harness storageKey="pins" />);
    expect(screen.getByTestId("pins")).toHaveTextContent("name:none,email:left,total:right");
    expect(window.localStorage.getItem("pins")).toBeNull();
  });
});
