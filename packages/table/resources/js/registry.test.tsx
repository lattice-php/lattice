import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode, stubClipboard } from "@lattice-php/core/test-support";
import type { TableColumn } from "./types";
import { Provider } from "@lattice-php/lattice/provider";
import { createRegistry } from "@lattice-php/core/registry";
import { col } from "./test-support";
import { ColumnCell } from "./components/table-cell";

describe("column registry", () => {
  it("dispatches a registered custom cell renderer", () => {
    const registry = createRegistry({
      name: "test",
      extensions: {
        "table.columns": {
          "column.upper": ({ value }: { value: unknown }) => (
            <span>{String(value).toUpperCase()}</span>
          ),
        },
      },
    });

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
                  column={col({ key: "b", label: "B", type: "column.text" })}
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
                    type: "column.stack",
                    schema: [
                      fakeNode({ type: "text", props: { dataBindings: { text: "name" } } }),
                      fakeNode({ type: "text", props: { dataBindings: { text: "email" } } }),
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
    const registry = createRegistry({
      name: "test",
      extensions: {
        "table.columns": {
          "column.stack": () => <span>custom-stack</span>,
        },
      },
    });

    render(
      <Provider registry={registry}>
        <table>
          <tbody>
            <tr>
              <td>
                <ColumnCell
                  column={col({ key: "identity", label: "Identity", type: "column.stack" })}
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

  function renderCell(column: TableColumn, row: Record<string, unknown>) {
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

  it("copies the text cell value and shows the copied state", async () => {
    const writeText = stubClipboard();

    renderCell(
      col({ key: "token", label: "Token", type: "column.text", props: { copyable: true } }),
      {
        token: "abc",
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /Copy Token/ }));

    expect(await screen.findByRole("button", { name: /Copied Token/ })).toBeVisible();
    expect(writeText).toHaveBeenCalledWith("abc");
  });

  it("renders a text cell as an external link", () => {
    renderCell(
      col({
        key: "site",
        label: "Site",
        type: "column.text",
        props: { link: { href: "/go", external: true } },
      }),
      { site: "Visit" },
    );

    const link = screen.getByRole("link", { name: "Visit" });
    expect(link).toHaveAttribute("href", "/go");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders a text cell as an internal link", () => {
    renderCell(
      col({
        key: "site",
        label: "Site",
        type: "column.text",
        props: { link: { href: "/in", external: false } },
      }),
      { site: "Go" },
    );

    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/in");
    expect(link).not.toHaveAttribute("target");
  });
});
