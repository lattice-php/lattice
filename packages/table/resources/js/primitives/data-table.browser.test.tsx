import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import {
  buildColumnGridTemplate,
  buildPinnedOffsets,
  type SizableColumn,
} from "@lattice-php/ui/lib/column-sizing";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableGrid,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
  dataTableUtilityTracks,
} from "./data-table";

const columns: SizableColumn[] = Array.from({ length: 8 }, (_, index) => ({
  key: `col${index}`,
  width: "md",
  pin: index === 0 ? "left" : undefined,
}));

function StaticTable() {
  const tracks = dataTableUtilityTracks({ actions: true });
  const sizing = { columns, ...tracks };

  return (
    <div style={{ display: "flex", width: "600px" }}>
      <DataTable>
        <DataTableGrid
          columns={buildColumnGridTemplate(sizing)}
          pinned
          style={buildPinnedOffsets({ ...sizing, hasActions: true })}
        >
          <DataTableHeader>
            <DataTableHeaderRow>
              {columns.map((column, index) => (
                <DataTableHeaderCell
                  key={column.key}
                  pinBoundary={column.pin ? "end" : undefined}
                  pinIndex={index}
                  pinned={column.pin}
                >
                  {`Column ${index}`}
                </DataTableHeaderCell>
              ))}
              <DataTableHeaderCell kind="filler" />
              <DataTableHeaderCell kind="actions" pinned="right" pinBoundary="start">
                Actions
              </DataTableHeaderCell>
            </DataTableHeaderRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableRow>
              {columns.map((column, index) => (
                <DataTableCell
                  key={column.key}
                  label={`Column ${index}`}
                  pinBoundary={column.pin ? "end" : undefined}
                  pinIndex={index}
                  pinned={column.pin}
                >
                  {`Value ${index}`}
                </DataTableCell>
              ))}
              <DataTableCell kind="filler" />
              <DataTableCell kind="actions" pinned="right" pinBoundary="start" />
            </DataTableRow>
          </DataTableBody>
        </DataTableGrid>
      </DataTable>
    </div>
  );
}

describe("DataTable primitives in a browser", () => {
  it("keeps pinned tracks in place while the unpinned columns scroll away", async () => {
    const screen = await render(<StaticTable />);

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const pinnedHeader = screen.getByRole("columnheader", { name: "Column 0" }).element();
    const pinnedCell = screen.getByRole("cell", { name: "Value 0" }).element();
    const actionsHeader = screen.getByRole("columnheader", { name: "Actions" }).element();
    const unpinnedCell = screen.getByRole("cell", { name: "Value 7" }).element();
    const pinnedLeftBefore = pinnedCell.getBoundingClientRect().left;
    const unpinnedLeftBefore = unpinnedCell.getBoundingClientRect().left;
    const gridScrollRight = gridScroll.getBoundingClientRect().right;

    expect(gridScroll.scrollWidth).toBeGreaterThan(gridScroll.clientWidth);
    expect(pinnedHeader.getBoundingClientRect().left).toBe(pinnedLeftBefore);
    expect(getComputedStyle(pinnedCell).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    gridScroll.scrollLeft = gridScroll.scrollWidth;

    await expect.poll(() => pinnedCell.getBoundingClientRect().left).toBe(pinnedLeftBefore);
    expect(pinnedHeader.getBoundingClientRect().left).toBe(pinnedLeftBefore);
    expect(unpinnedCell.getBoundingClientRect().left).toBeLessThan(unpinnedLeftBefore);
    expect(Math.abs(actionsHeader.getBoundingClientRect().right - gridScrollRight)).toBeLessThan(1);
  });
});
