import { Schema } from "@lattice-php/core";
import { BoardFocusDirection } from "../../board-keyboard";
import { BoardColumnView } from "../../use-board-state";
import { BoardColumnData } from "../../generated";
export type BoardColumnProps = {
  canMove: boolean;
  cardSchema: Schema;
  column: BoardColumnData;
  focusedCardId: string | null;
  moving: boolean;
  onFocusCard: (cardId: string) => void;
  onLoadMore: () => void;
  onMoveFocus: (cardId: string, direction: BoardFocusDirection) => void;
  registerCardRef: (cardId: string, element: HTMLLIElement | null) => void;
  view: BoardColumnView;
};
export declare function BoardColumn({
  canMove,
  cardSchema,
  column,
  focusedCardId,
  moving,
  onFocusCard,
  onLoadMore,
  onMoveFocus,
  registerCardRef,
  view,
}: BoardColumnProps): import("react").JSX.Element;
