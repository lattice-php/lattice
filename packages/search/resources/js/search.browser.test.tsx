import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { expect, it } from "vitest";
import { jsonResponse } from "@lattice-php/core/test-support";
import { withModal } from "@lattice-php/ui/test/modal";
import { SearchBox } from "./components/search-box/search-box";
import { searchResponse, stubSearchFetch } from "./test-support";

it("opens with the keyboard shortcut but leaves editing shortcuts alone", async () => {
  stubSearchFetch(() => jsonResponse(searchResponse([], { mode: "recent" })));

  const screen = await render(
    withModal(
      <>
        <input aria-label="Editor" />
        <SearchBox
          data-test="search-trigger"
          endpoint="/lattice/search"
          perPage={20}
          placeholder="Find anything"
          shortcut
        />
      </>,
    ),
  );

  await screen.getByRole("textbox", { name: "Editor" }).click();
  await userEvent.keyboard("{Control>}k{/Control}");
  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

  await userEvent.click(document.body);
  await userEvent.keyboard("{Control>}k{/Control}");

  await expect.element(screen.getByRole("dialog")).toBeVisible();
  await expect.element(screen.getByRole("searchbox", { name: "Find anything" })).toHaveFocus();
});

it("closes with the keyboard shortcut even while the search input has focus, and restores focus to the trigger", async () => {
  stubSearchFetch(() => jsonResponse(searchResponse([], { mode: "recent" })));

  const screen = await render(
    withModal(
      <SearchBox
        data-test="search-trigger"
        endpoint="/lattice/search"
        perPage={20}
        placeholder="Find anything"
        shortcut
      />,
    ),
  );

  await screen.getByTestId("search-trigger").click();
  await expect.element(screen.getByRole("dialog")).toBeVisible();
  await expect.element(screen.getByRole("searchbox", { name: "Find anything" })).toHaveFocus();

  await userEvent.keyboard("{Control>}k{/Control}");

  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
  await expect.element(screen.getByTestId("search-trigger")).toHaveFocus();
});
