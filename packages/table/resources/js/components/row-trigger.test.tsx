import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@lattice-php/lattice/provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TableNode } from "@lattice-php/table/types";
import { fakeNode } from "@lattice-php/core/test-support";
import { ActionInteractionProvider } from "@lattice-php/action";
import { ModalProvider } from "@lattice-php/ui/components/modal/modal-host";
import type { Node } from "@lattice-php/core/types";
import { col, rowClick, tableNode } from "../test-support";

const apiFetch = vi.hoisted(() =>
  vi.fn<(url: string, init?: Record<string, unknown>) => Promise<Response>>(
    async () => new Response(JSON.stringify({ effects: [] }), { status: 200 }),
  ),
);

vi.mock("@lattice-php/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

const { TableComponent } = await import("./table");

const action = fakeNode({
  type: "action",
  id: "workbench.products.archive",
  props: {
    label: "Archive",
    method: "patch",
    endpoint: "/lattice/actions/workbench.products.archive",
    ref: "sealed-ref",
  },
});

const modal = fakeNode({
  type: "modal",
  id: "product-details",
  props: { title: "Product details" },
});

function renderRow(node: TableNode): HTMLElement {
  render(
    <ModalProvider>
      <ActionInteractionProvider>
        <TableComponent node={node}>{null}</TableComponent>
      </ActionInteractionProvider>
    </ModalProvider>,
  );

  return screen.getByRole("cell", { name: "Lamp" });
}

function rowWith(click: Node<"table.row-click">): TableNode {
  return tableNode({
    columns: [col({ key: "name", label: "Name" })],
    data: [{ id: 1, name: "Lamp", rowClick: click }],
  });
}

describe("row click behaviors", () => {
  afterEach(() => {
    apiFetch.mockClear();
  });

  it("runs the row's action when a plain cell is clicked", async () => {
    const cell = renderRow(rowWith(rowClick({ action })));

    fireEvent.click(cell);

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith(
        "/lattice/actions/workbench.products.archive",
        expect.objectContaining({ method: "patch", ref: "sealed-ref" }),
      ),
    );
  });

  it("runs the row's action when the focused row is activated from the keyboard", async () => {
    const cell = renderRow(rowWith(rowClick({ action })));

    fireEvent.keyDown(cell.closest('[data-slot="table-row"]')!, { key: " " });

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
  });

  it("ignores further clicks while the row's action is in flight", async () => {
    apiFetch.mockImplementationOnce(() => new Promise(() => {}));

    const cell = renderRow(rowWith(rowClick({ action })));

    fireEvent.click(cell);

    await waitFor(() =>
      expect(cell.closest('[data-slot="table-row"]')).toHaveAttribute("aria-busy", "true"),
    );

    fireEvent.click(cell);

    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it("opens the row's modal when a plain cell is clicked", () => {
    const cell = renderRow(rowWith(rowClick({ modal })));

    expect(screen.queryByText("Product details")).not.toBeInTheDocument();

    fireEvent.click(cell);

    expect(screen.getByText("Product details")).toBeInTheDocument();
  });
});
