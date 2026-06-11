import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnData } from "@lattice/lattice/types/generated";
import { Provider } from "../provider";
import { createColumnPlugin, createColumnRegistry } from "./column-registry";
import { ColumnCell } from "./components/table-cell";

function col(partial: Partial<ColumnData> & Pick<ColumnData, "key" | "label">): ColumnData {
  return {
    type: "text",
    sortable: null,
    filter: null,
    date: null,
    copyable: null,
    link: null,
    columns: null,
    props: null,
    ...partial,
  };
}

describe("column registry", () => {
  it("dispatches a registered custom cell renderer", () => {
    const columns = createColumnRegistry(
      createColumnPlugin({
        name: "test",
        columns: {
          "column.upper": ({ value }) => <span>{String(value).toUpperCase()}</span>,
        },
      }),
    );

    render(
      <Provider columns={columns}>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell column={col({ key: "a", label: "A", type: "column.upper" })} row={{ a: "hi" }} />
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
                <ColumnCell column={col({ key: "b", label: "B", type: "text" })} row={{ b: "plain" }} />
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
    const columns = createColumnRegistry(
      createColumnPlugin({
        name: "test",
        columns: {
          stack: () => <span>custom-stack</span>,
        },
      }),
    );

    render(
      <Provider columns={columns}>
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
});
