import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { createAction as fakeCreateAction } from "../../test-support";
import { QuickAdd } from "./quick-add";

function stubCreateFetch(status = 200) {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(jsonResponse({ effects: [] }, { status }));
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("QuickAdd", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing without a create action", () => {
    const { container } = render(
      <QuickAdd columnKey="todo" createAction={null} onCreated={() => {}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("expands into a title input when the trigger is clicked", () => {
    render(<QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(screen.getByPlaceholderText("Enter a title...")).toBeInTheDocument();
  });

  it("submits the column and title on enter, then clears and stays open", async () => {
    const fetchMock = stubCreateFetch();
    const onCreated = vi.fn();

    render(<QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={onCreated} />);
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    const input = screen.getByPlaceholderText("Enter a title...");
    fireEvent.change(input, { target: { value: "Write spec" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));

    expect(fetchMock).toHaveBeenCalledWith(
      "/lattice/actions/create-task",
      expect.objectContaining({ method: "POST" }),
    );
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ column: "todo", title: "Write spec" });
    expect((init.headers as Record<string, string>)["X-Lattice-Ref"]).toBe("create-ref");

    expect(screen.getByPlaceholderText("Enter a title...")).toHaveValue("");
  });

  it("does not submit a blank title", () => {
    const fetchMock = stubCreateFetch();

    render(<QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    const input = screen.getByPlaceholderText("Enter a title...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the title and stays expanded when the action fails", async () => {
    const fetchMock = stubCreateFetch(422);
    const onCreated = vi.fn();

    render(<QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={onCreated} />);
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    const input = screen.getByPlaceholderText("Enter a title...");
    fireEvent.change(input, { target: { value: "Write spec" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Enter a title...")).toHaveValue("Write spec");
  });

  it("collapses on escape and clears the title", () => {
    render(<QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    const input = screen.getByPlaceholderText("Enter a title...");
    fireEvent.change(input, { target: { value: "Write spec" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByPlaceholderText("Enter a title...")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add card" })).toBeInTheDocument();
  });

  it("collapses on blur", () => {
    render(<QuickAdd columnKey="todo" createAction={fakeCreateAction} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    fireEvent.blur(screen.getByPlaceholderText("Enter a title..."));

    expect(screen.queryByPlaceholderText("Enter a title...")).not.toBeInTheDocument();
  });
});
