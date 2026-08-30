import type { RenderOptions, RenderResult } from "@testing-library/react";
import { vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import type { Node, RendererComponent } from "@lattice-php/core";
import { fakeNode, jsonResponse, renderWithRegistry } from "@lattice-php/core/test-support";
import { actionComponents } from "@lattice-php/action";
import BoardAdapter from "./components/board/board-adapter";
import type { BoardColumnCards, BoardColumnData, BoardResult } from "./generated";
import type { FilterIndicator, FilterNode } from "@lattice-php/table";

/** Stand-in body component for a card's materialized schema. */
export const TestText: RendererComponent = ({ node }) => (
  <span>{String(node.props?.text ?? "")}</span>
);

export const testRegistry = createRegistry(actionComponents, {
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

export function boardResult(
  columns: BoardColumnCards[],
  indicators: FilterIndicator[] = [],
): BoardResult {
  return { columns, indicators };
}

export function boardFilter(key: string, extra: Partial<FilterNode> = {}): FilterNode {
  return {
    key,
    props: { label: key },
    schema: [
      {
        type: "field.select",
        props: {
          name: "value",
          label: key,
          options: [],
          multiple: false,
          searchable: false,
          placeholder: null,
        },
      },
    ],
    type: "filter.select",
    ...extra,
  };
}

export const cardTemplate = [{ props: { dataBindings: { text: "title" } }, type: "test.text" }];

export const moveAction = fakeNode({
  props: { endpoint: "/lattice/actions/move-task", method: "post", ref: "move-ref" },
  type: "action",
});

export const cardAction = fakeNode({
  props: { endpoint: "/lattice/actions/open-task", method: "post", ref: "card-ref" },
  type: "action",
});

export const createAction = fakeNode({
  props: { endpoint: "/lattice/actions/create-task", method: "post", ref: "create-ref" },
  type: "action",
});

export function deleteAction(cardId: string | number, label = "Delete"): Node {
  return fakeNode({
    id: `delete-${cardId}`,
    props: {
      endpoint: `/lattice/actions/delete-task-${cardId}`,
      label,
      method: "delete",
      ref: `delete-ref-${cardId}`,
      removesRecord: true,
    },
    type: "action",
  });
}

/** An action without the `removesRecord` hint — optimistic removal must not fire for it. */
export function archiveAction(cardId: string | number, label = "Archive"): Node {
  return fakeNode({
    id: `archive-${cardId}`,
    props: {
      endpoint: `/lattice/actions/archive-task-${cardId}`,
      label,
      method: "post",
      ref: `archive-ref-${cardId}`,
    },
    type: "action",
  });
}

export function stubMoveFetch(status = 200) {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(jsonResponse({ effects: [] }, { status }));
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

export function renderBoard(
  props: Record<string, unknown>,
  id = "b1",
  options?: RenderOptions,
): RenderResult {
  const node = fakeNode({
    id,
    props: {
      cardAction: null,
      columns: [],
      createAction: null,
      endpoint: null,
      filters: [],
      moveAction: null,
      perColumn: 25,
      ref: null,
      result: null,
      searchable: false,
      ...props,
    },
    schema: cardTemplate,
    type: "board",
  });

  return renderWithRegistry(<BoardAdapter node={node}>{null}</BoardAdapter>, testRegistry, options);
}
