import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import { withModal } from "@lattice-php/ui/test/modal";
import { searchResponse, stubSearchFetch } from "../../test-support";
import { SearchBoxAdapter } from "./search-box-adapter";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("maps the wire node onto the trigger, its identity and the collapsed chrome", () => {
  stubSearchFetch(() => jsonResponse(searchResponse([], { mode: "recent" })));
  const node = fakeNode({
    type: "search.box",
    id: "global-search",
    props: {
      endpoint: "/lattice/search",
      perPage: 20,
      placeholder: "Find anything",
      shortcut: true,
      title: null,
    },
  });

  render(
    withModal(
      <CollapsedProvider collapsed={true}>
        <SearchBoxAdapter node={node}>{null}</SearchBoxAdapter>
      </CollapsedProvider>,
    ),
  );

  const trigger = screen.getByTestId("global-search");
  expect(trigger).toHaveAccessibleName("Find anything");
  expect(trigger).toHaveAttribute("aria-keyshortcuts", "Meta+K Control+K");
  expect(trigger).not.toHaveTextContent("Find anything");

  fireEvent.click(trigger);

  expect(screen.getByRole("searchbox", { name: "Find anything" })).toBeInTheDocument();
});
