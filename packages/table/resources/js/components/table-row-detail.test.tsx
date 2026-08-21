import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { jsonResponse, renderWithRegistry, stubFetch } from "@lattice-php/core/test-support";
import type { TableNode, TableRow } from "@lattice-php/table/types";
import { col, tableNode } from "../test-support";
import { TableComponent } from "./table";

function detailNode(id: string) {
  return {
    type: "fragment",
    id: `detail-${id}`,
    props: { lazy: true, endpoint: `/lattice/fragments/detail-${id}`, ref: "sig", size: "md" },
  };
}

function node(rows: TableRow[]): TableNode {
  return tableNode({ columns: [col({ key: "name", label: "Name" })], data: rows });
}

describe("expandable table rows", () => {
  it("renders an expander only for rows that carry a detail", () => {
    renderWithRegistry(
      <TableComponent
        node={node([
          { id: "1", name: "Order 1", detail: detailNode("1") },
          { id: "2", name: "Order 2" },
        ])}
      />,
      registry,
    );

    expect(screen.getAllByRole("button", { name: "Toggle detail" })).toHaveLength(1);
  });

  it("loads the detail fragment over AJAX on expand and hides it on collapse", async () => {
    const fetch = stubFetch(
      jsonResponse({ schema: [{ type: "text", props: { text: "Line items loaded" } }] }),
    );

    renderWithRegistry(
      <TableComponent node={node([{ id: "1", name: "Order 1", detail: detailNode("1") }])} />,
      registry,
    );

    expect(screen.queryByText("Line items loaded")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Toggle detail" }));

    await waitFor(() => {
      expect(screen.getByText("Line items loaded")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/lattice/fragments/detail-1"),
      expect.anything(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle detail" }));

    await waitFor(() => {
      expect(screen.queryByText("Line items loaded")).toBeNull();
    });
  });
});
