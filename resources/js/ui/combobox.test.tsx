import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Option } from "@lattice-php/lattice/core/types";
import { Combobox } from "./combobox";

const OPTIONS: Option[] = [
  { label: "Red", value: "red", data: null },
  { label: "Blue", value: "blue", data: null },
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

  it("omits test ids and shows the empty label when no options match", () => {
    render(
      <Combobox
        emptyLabel="No matches"
        onOpenChange={() => {}}
        onSelect={() => {}}
        open
        options={[]}
        selected={[]}
        trigger={<span>Open</span>}
      />,
    );

    expect(screen.getByText("No matches")).toBeVisible();
    expect(document.querySelector('[data-slot="combobox-search"]')).not.toHaveAttribute(
      "data-test",
    );
  });

  it("debounces a remote search instead of filtering locally", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn<(q: string) => void>();
    render(<Harness onSearch={onSearch} />);

    fireEvent.click(screen.getByText("Open"));
    fireEvent.change(screen.getByTestId("cb-search"), { target: { value: "x" } });

    act(() => vi.advanceTimersByTime(250));

    expect(onSearch).toHaveBeenCalledWith("x");
    expect(screen.getByRole("option", { name: "Red" })).toBeVisible();
  });

  it("renders rich option content while keeping the label as accessible name", () => {
    const onSelect = vi.fn<(v: string) => void>();
    render(
      <Combobox
        onOpenChange={() => {}}
        onSelect={onSelect}
        open
        options={OPTIONS}
        renderOption={(option) => (
          <span>
            {option.label}
            <span>{option.value.toUpperCase()}</span>
          </span>
        )}
        selected={[]}
        testId="cb"
        trigger={<span>Open</span>}
      />,
    );

    const red = screen.getByRole("option", { name: "Red" });
    expect(red).toHaveTextContent("RED");

    fireEvent.click(red);
    expect(onSelect).toHaveBeenCalledWith("red");
  });
});
