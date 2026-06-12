import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnData } from "@lattice/lattice/types/generated";
import { Provider } from "../provider";
import { createPlugin, createRegistry } from "../core/registry";
import { ColumnCell } from "./components/table-cell";

function col(partial: Partial<ColumnData> & Pick<ColumnData, "key" | "label">): ColumnData {
  return {
    type: "text",
    sortable: null,
    filter: null,
    columns: null,
    props: null,
    ...partial,
  };
}

describe("column registry", () => {
  it("dispatches a registered custom cell renderer", () => {
    const registry = createRegistry(
      createPlugin({
        name: "test",
        columns: {
          "column.upper": ({ value }) => <span>{String(value).toUpperCase()}</span>,
        },
      }),
    );

    render(
      <Provider registry={registry}>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell
                  column={col({ key: "a", label: "A", type: "column.upper" })}
                  row={{ a: "hi" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Provider>,
    );

    expect(screen.getByText("HI")).toBeVisible();
  });

  it("falls back to the built-in text renderer for unregistered types", () => {
    render(
      <Provider>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell
                  column={col({ key: "b", label: "B", type: "text" })}
                  row={{ b: "plain" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Provider>,
    );

    expect(screen.getByText("plain")).toBeVisible();
  });

  it("falls back to the built-in stack renderer when no custom renderer is registered", () => {
    render(
      <Provider>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell
                  column={col({
                    key: "identity",
                    label: "Identity",
                    type: "stack",
                    columns: [
                      col({ key: "name", label: "Name", type: "text" }),
                      col({ key: "email", label: "Email", type: "text" }),
                    ],
                  })}
                  row={{ name: "Ada", email: "ada@example.com" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Provider>,
    );

    expect(screen.getByText("Ada")).toBeVisible();
    expect(screen.getByText("ada@example.com")).toBeVisible();
  });

  it("custom renderer takes precedence over built-in stack", () => {
    const registry = createRegistry(
      createPlugin({
        name: "test",
        columns: {
          stack: () => <span>custom-stack</span>,
        },
      }),
    );

    render(
      <Provider registry={registry}>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell
                  column={col({ key: "identity", label: "Identity", type: "stack" })}
                  row={{ identity: "ignored" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Provider>,
    );

    expect(screen.getByText("custom-stack")).toBeVisible();
  });

  function renderCell(column: ColumnData, row: Record<string, unknown>) {
    return render(
      <Provider registry={createRegistry()}>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell column={column} row={row} />
              </td>
            </tr>
          </tbody>
        </table>
      </Provider>,
    );
  }

  it("renders a badge cell with its mapped colour", () => {
    renderCell(
      col({
        key: "status",
        label: "Status",
        type: "badge",
        props: { colors: { active: "green" } },
      }),
      { status: "active" },
    );

    const badge = screen.getByText("active");
    expect(badge).toBeVisible();
    expect(badge.className).toContain("lt-cell-tone-green");
  });

  it("renders an icon cell from the value map", () => {
    renderCell(
      col({ key: "verified", label: "Verified", type: "icon", props: { icons: { "1": "check" } } }),
      { verified: "1" },
    );

    expect(screen.getByLabelText("1")).toBeVisible();
  });

  it("renders an image cell as a circular avatar", () => {
    renderCell(
      col({ key: "avatar", label: "Avatar", type: "image", props: { circular: true, size: 40 } }),
      { avatar: "https://example.com/a.png" },
    );

    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
    expect(img.className).toContain("rounded-full");
  });
});
