import { afterEach, describe, expect, it, vi } from "vitest";
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
});
