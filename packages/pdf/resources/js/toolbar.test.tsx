import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Toolbar } from "./toolbar";
import type { ToolbarProps } from "./toolbar";

function toolbarProps(overrides: Partial<ToolbarProps> = {}): ToolbarProps {
  return {
    sidebarToggle: true,
    sidebarOpen: false,
    onToggleSidebar: vi.fn(),
    currentPage: 1,
    totalPages: 5,
    onJump: vi.fn(),
    zoomPercent: 100,
    canZoomIn: true,
    canZoomOut: true,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFitWidth: vi.fn(),
    searchable: true,
    query: "",
    onQueryChange: vi.fn(),
    matchCount: 0,
    currentMatch: 0,
    onNextMatch: vi.fn(),
    onPreviousMatch: vi.fn(),
    downloadable: true,
    url: "https://files.example.test/manual.pdf",
    filename: "manual.pdf",
    ...overrides,
  };
}

it("clamps a page jump to the document bounds on Enter", () => {
  const props = toolbarProps();
  render(<Toolbar {...props} />);

  const input = screen.getByLabelText("Go to page");
  fireEvent.change(input, { target: { value: "99" } });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(props.onJump).toHaveBeenCalledWith(5);
  expect(input).toHaveValue("5");
});

it("restores the current page when a jump input is not a number", () => {
  const props = toolbarProps({ currentPage: 3 });
  render(<Toolbar {...props} />);

  const input = screen.getByLabelText("Go to page");
  fireEvent.change(input, { target: { value: "abc" } });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(props.onJump).not.toHaveBeenCalled();
  expect(input).toHaveValue("3");
});

it("drives zoom through the buttons and blocks them at the limits", () => {
  const props = toolbarProps({ canZoomIn: false });
  render(<Toolbar {...props} />);

  fireEvent.click(screen.getByLabelText("Zoom out"));
  fireEvent.click(screen.getByText("Fit width"));

  expect(props.onZoomOut).toHaveBeenCalledOnce();
  expect(props.onFitWidth).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Zoom in")).toBeDisabled();
});

it("forwards search input and match navigation", () => {
  const props = toolbarProps({ query: "quick", matchCount: 4, currentMatch: 2 });
  render(<Toolbar {...props} />);

  fireEvent.change(screen.getByLabelText("Search document…"), { target: { value: "quicks" } });
  fireEvent.click(screen.getByLabelText("Next match"));
  fireEvent.click(screen.getByLabelText("Previous match"));

  expect(props.onQueryChange).toHaveBeenCalledWith("quicks");
  expect(props.onNextMatch).toHaveBeenCalledOnce();
  expect(props.onPreviousMatch).toHaveBeenCalledOnce();
  expect(screen.getByText("2 of 4")).toBeInTheDocument();
});

it("toggles the sidebar and reflects its open state", () => {
  const props = toolbarProps({ sidebarOpen: true });
  const { rerender } = render(<Toolbar {...props} />);

  const toggle = screen.getByLabelText("Toggle sidebar");
  fireEvent.click(toggle);

  expect(props.onToggleSidebar).toHaveBeenCalledOnce();
  expect(toggle).toHaveAttribute("aria-pressed", "true");

  rerender(<Toolbar {...toolbarProps({ sidebarToggle: false })} />);

  expect(screen.queryByLabelText("Toggle sidebar")).not.toBeInTheDocument();
});

it("hides search and download when the wire disables them", () => {
  const props = toolbarProps();
  const { rerender } = render(<Toolbar {...props} />);

  expect(screen.getByLabelText("Search document…")).toBeInTheDocument();
  expect(screen.getByLabelText("Download")).toHaveAttribute(
    "href",
    "https://files.example.test/manual.pdf",
  );

  rerender(<Toolbar {...toolbarProps({ searchable: false, downloadable: false })} />);

  expect(screen.queryByLabelText("Search document…")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Download")).not.toBeInTheDocument();
});
