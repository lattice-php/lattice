import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { operation } from "../test-support";
import { OperationHeader } from "./OperationHeader";

const listUsers = operation([], [], {
  summary: {
    id: "list-users",
    method: "GET",
    path: "/users",
    title: "List users",
    deprecated: false,
  },
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OperationHeader", () => {
  it("copies the complete operation URL without duplicating the Markdown action", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    const screen = await render(
      <OperationHeader operation={listUsers} baseUrl="https://api.example.test" />,
    );
    const urlCopy = screen.getByRole("button", { name: "Copy operation URL" });

    await expect
      .element(screen.getByText("https://api.example.test/users", { exact: true }))
      .toBeVisible();
    await expect.element(urlCopy).not.toHaveTextContent("Copy");
    await expect
      .element(screen.getByRole("button", { name: "Copy as Markdown" }))
      .not.toBeInTheDocument();

    await urlCopy.click();
    await expect.poll(() => writeText.mock.calls[0]?.[0]).toBe("https://api.example.test/users");
  });

  it("opens the operation tooltip as markup from a keyboard-reachable trigger", async () => {
    const screen = await render(
      <OperationHeader
        operation={operation([], [], {
          ...listUsers,
          description: "Returns every user in the account.",
          tooltip: '<a href="https://docs.example.test/users">User guide</a>',
        })}
        baseUrl="https://api.example.test"
      />,
    );

    await expect.element(screen.getByText("Returns every user in the account.")).toBeVisible();
    await expect.element(screen.getByRole("link", { name: "User guide" })).not.toBeInTheDocument();

    await userEvent.tab();
    await userEvent.tab();
    const trigger = screen.getByRole("button", { name: "More information" });
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");

    const link = screen.getByRole("link", { name: "User guide" });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute("href", "https://docs.example.test/users");
    await expect.element(screen.getByText("Returns every user in the account.")).toBeVisible();
  });
});
