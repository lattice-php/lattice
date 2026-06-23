import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnData } from "@lattice-php/lattice/types/generated";
import { Provider } from "../provider";
import { createPlugin, createRegistry } from "../core/registry";
import { ColumnCell } from "./components/table-cell";

function col(partial: Partial<ColumnData> & Pick<ColumnData, "key" | "label">): ColumnData {
  const type = partial.type ?? "column.text";

  return {
    type,
    width: type === "column.stack" ? "xl" : "md",
    sortable: null,
    toggleable: null,
    hiddenByDefault: null,
    filter: null,
    columns: null,
    props: null,
    align: "start",
    ...partial,
  };
}

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

function stubClipboard(writeText = vi.fn<Clipboard["writeText"]>(async () => undefined)) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });

  return writeText;
}

describe("column registry", () => {
  afterEach(() => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }

    vi.restoreAllMocks();
  });

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
                    columns: [
                      col({ key: "name", label: "Name", type: "column.text" }),
                      col({ key: "email", label: "Email", type: "column.text" }),
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
          "column.stack": () => <span>custom-stack</span>,
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
        type: "column.badge",
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
      col({
        key: "verified",
        label: "Verified",
        type: "column.icon",
        props: { icons: { "1": "check" } },
      }),
      { verified: "1" },
    );

    expect(screen.getByLabelText("1")).toBeVisible();
  });

  it("renders an image cell as a circular avatar", () => {
    renderCell(
      col({
        key: "avatar",
        label: "Avatar",
        type: "column.image",
        props: { circular: true, size: 40 },
      }),
      { avatar: "https://example.com/a.png" },
    );

    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
    expect(img.className).toContain("rounded-full");
  });

  it("renders a copyable text cell from props", () => {
    renderCell(
      col({ key: "token", label: "Token", type: "column.text", props: { copyable: true } }),
      {
        token: "abc",
      },
    );

    expect(screen.getByText("abc")).toBeVisible();
    expect(screen.getByRole("button", { name: /Copy Token/ })).toBeVisible();
  });

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

  it("renders a badge cell with the gray fallback for an unmapped value", () => {
    renderCell(
      col({
        key: "status",
        label: "Status",
        type: "column.badge",
        props: { colors: { active: "green" } },
      }),
      { status: "archived" },
    );

    expect(screen.getByText("archived").className).toContain("lt-cell-tone-gray");
  });

  it("renders nothing for a badge cell with an empty value", () => {
    const { container } = renderCell(
      col({ key: "status", label: "Status", type: "column.badge" }),
      {
        status: "",
      },
    );

    expect(container.querySelector(".lt-cell-badge")).toBeNull();
  });

  it("renders nothing for an icon cell with no matching icon", () => {
    const { container } = renderCell(
      col({ key: "flag", label: "Flag", type: "column.icon", props: { icons: { "1": "check" } } }),
      { flag: "0" },
    );

    expect(container.querySelector(".lt-cell-icon")).toBeNull();
  });

  it("renders a square image cell at the default size", () => {
    renderCell(
      col({ key: "avatar", label: "Avatar", type: "column.image", props: { circular: false } }),
      {
        avatar: "https://example.com/a.png",
      },
    );

    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img.className).toContain("rounded-lt-sm");
    expect(img).toHaveAttribute("width", "32");
  });

  it("renders nothing for an image cell with a non-string value", () => {
    const { container } = renderCell(
      col({ key: "avatar", label: "Avatar", type: "column.image" }),
      {
        avatar: 42,
      },
    );

    expect(container.querySelector("img")).toBeNull();
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

  it("renders an empty stack cell when it has no nested columns", () => {
    const { container } = renderCell(col({ key: "x", label: "X", type: "column.stack" }), {
      x: "v",
    });

    expect(container.querySelector(".grid")).not.toBeNull();
  });

  it("falls back to the text renderer for an unknown column type", () => {
    renderCell(col({ key: "x", label: "X", type: "totally.unknown" }), { x: "plain" });

    expect(screen.getByText("plain")).toBeVisible();
  });

  it("renders an icon cell with a mapped colour", () => {
    renderCell(
      col({
        key: "s",
        label: "S",
        type: "column.icon",
        props: { icons: { ok: "check" }, colors: { ok: "green" } },
      }),
      { s: "ok" },
    );

    expect(screen.getByLabelText("ok").className).toContain("lt-cell-tone-green");
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
