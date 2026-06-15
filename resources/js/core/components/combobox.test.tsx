import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Option } from "@lattice-php/lattice/core/types";
import { Combobox } from "./combobox";

const OPTIONS: Option[] = [
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
];

function Harness({
  multiple = false,
  onSearch,
  onSelect,
  options = OPTIONS,
}: {
  multiple?: boolean;
  onSearch?: (q: string) => void;
  onSelect?: (v: string) => void;
  options?: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Combobox
      multiple={multiple}
      onSearch={onSearch}
      onSelect={(value) => {
        setSelected((current) =>
          current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
        );
        onSelect?.(value);
      }}
      open={open}
      onOpenChange={setOpen}
      options={options}
      selected={selected}
      testId="cb"
      trigger={<span>Open</span>}
    />
  );
}

afterEach(() => vi.useRealTimers());

describe("Combobox", () => {
  it("opens, filters locally, and closes after a single select", () => {
    const onSelect = vi.fn<(v: string) => void>();
    render(<Harness onSelect={onSelect} />);

    expect(screen.queryByRole("option", { name: "Red" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("option", { name: "Red" })).toBeVisible();

    fireEvent.change(screen.getByTestId("cb-search"), { target: { value: "blu" } });
    expect(screen.queryByRole("option", { name: "Red" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "Blue" }));
    expect(onSelect).toHaveBeenCalledWith("blue");
    expect(screen.queryByRole("option", { name: "Blue" })).not.toBeInTheDocument();
  });

  it("stays open and marks selection for a multi-select", () => {
    render(<Harness multiple />);

    fireEvent.click(screen.getByText("Open"));
    fireEvent.click(screen.getByRole("option", { name: "Red" }));

    const red = screen.getByRole("option", { name: "Red" });
    expect(red).toHaveAttribute("aria-selected", "true");
  });

  it("debounces a remote search instead of filtering locally", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn<(q: string) => void>();
    render(<Harness onSearch={onSearch} />);

    fireEvent.click(screen.getByText("Open"));
    fireEvent.change(screen.getByTestId("cb-search"), { target: { value: "x" } });

    act(() => vi.advanceTimersByTime(250));

    expect(onSearch).toHaveBeenCalledWith("x");
    // Remote mode shows options as given (no local filtering).
    expect(screen.getByRole("option", { name: "Red" })).toBeVisible();
  });
});
