import type { RenderResult } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import { fakeNode, jsonResponse, renderWithRegistry } from "@lattice-php/core/test-support";
import BoardAdapter from "./components/board/board-adapter";
import type { BoardColumnCards, BoardColumnData, BoardResult } from "./generated";

/** Stand-in body component for a card's materialized schema. */
export const TestText: RendererComponent = ({ node }) => (
  <span>{String(node.props?.text ?? "")}</span>
);

export const testRegistry = createRegistry({
  components: {
    board: eagerComponent(BoardAdapter),
    "test.text": eagerComponent(TestText),
  },
  name: "test/board",
});

export function boardColumn(
  key: string,
  label: string,
  extra: Partial<BoardColumnData> = {},
): BoardColumnData {
  return { color: null, icon: null, key, label, ...extra };
}

export function boardCard(id: string | number, title: string, extra: Record<string, unknown> = {}) {
  return { id, title, ...extra };
}

export function boardColumnCards(
  key: string,
  cards: Record<string, unknown>[],
  extra: Partial<Omit<BoardColumnCards, "cards" | "key">> = {},
): BoardColumnCards {
  return { cards, hasMore: false, offset: 0, total: cards.length, ...extra, key };
}

export function boardResult(columns: BoardColumnCards[]): BoardResult {
  return { columns };
}

export function stubBoardFetch(...responses: BoardResult[]) {
  return responses.map((response) => jsonResponse(response));
}

export const cardTemplate = [{ props: { dataBindings: { text: "title" } }, type: "test.text" }];

export function renderBoard(props: Record<string, unknown>, id = "b1"): RenderResult {
  const node = fakeNode({
    id,
    props: { columns: [], endpoint: null, perColumn: 25, ref: null, result: null, ...props },
    schema: cardTemplate,
    type: "board",
  });

  return renderWithRegistry(<BoardAdapter node={node}>{null}</BoardAdapter>, testRegistry);
}
