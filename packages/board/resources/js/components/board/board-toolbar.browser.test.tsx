import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";
import { extendRegistry } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import { actionComponents } from "@lattice-php/action";
import { formComponents } from "@lattice-php/form";
import BoardAdapter from "./board-adapter";
import {
  boardColumn,
  boardColumnCards,
  boardFilter,
  boardResult,
  cardTemplate,
  testRegistry,
} from "../../test-support";

const registry = extendRegistry(testRegistry, actionComponents, formComponents);

function renderBoard(props: Record<string, unknown>) {
  const node = fakeNode({
    id: "toolbar-board",
    props: {
      cardAction: null,
      columns: [],
      createAction: null,
      endpoint: "/lattice/boards/tasks",
      filters: [],
      moveAction: null,
      perColumn: 25,
      query: { q: "", tf: {} },
      queryKey: null,
      ref: "board-ref",
      result: null,
      searchable: false,
      syncQuery: false,
      ...props,
    },
    schema: cardTemplate,
    type: "board",
  });

  return renderWithRegistry(<BoardAdapter node={node}>{null}</BoardAdapter>, registry);
}

describe("Board toolbar in a browser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("commits a debounced search into a reload request", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(boardResult([boardColumnCards("todo", [])])));
    vi.stubGlobal("fetch", fetchMock);

    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      result: boardResult([boardColumnCards("todo", [])]),
      searchable: true,
    });

    await userEvent.type(screen.getByRole("searchbox", { name: "Search" }), "Anna");

    await expect.poll(() => fetchMock.mock.calls.length).toBeGreaterThan(0);
    const [url] = fetchMock.mock.calls.at(-1) as [string];
    expect(new URL(url, "http://localhost").searchParams.get("q")).toBe("Anna");
  });

  it("opens the filter menu popover and renders the declared filter's control", async () => {
    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      filters: [boardFilter("assignee")],
      result: boardResult([boardColumnCards("todo", [])]),
    });

    await expect.element(screen.getByLabelText("assignee")).not.toBeInTheDocument();

    await screen.getByRole("button", { name: "Filters" }).click();

    await expect.element(screen.getByLabelText("assignee")).toBeVisible();
  });

  it("applies a filter menu selection as a tf request param", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(boardResult([boardColumnCards("todo", [])])));
    vi.stubGlobal("fetch", fetchMock);

    const screen = await renderBoard({
      columns: [boardColumn("todo", "To Do")],
      filters: [
        boardFilter("assignee", {
          schema: [
            {
              type: "field.select",
              props: {
                name: "value",
                label: "assignee",
                options: [
                  { label: "Anna", value: "Anna", data: null },
                  { label: "Ben", value: "Ben", data: null },
                ],
                multiple: false,
                searchable: false,
                placeholder: null,
              },
            },
          ],
        }),
      ],
      result: boardResult([boardColumnCards("todo", [])]),
    });

    await screen.getByRole("button", { name: "Filters" }).click();
    await screen.getByText("Select…").click();
    await screen.getByRole("option", { name: "Anna" }).click();

    await expect.poll(() => fetchMock.mock.calls.length).toBeGreaterThan(0);
    const [url] = fetchMock.mock.calls.at(-1) as [string];
    expect(new URL(url, "http://localhost").searchParams.get("tf[assignee][value]")).toBe("Anna");
  });
});
