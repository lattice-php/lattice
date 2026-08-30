import { Node } from "@lattice-php/core";
import { BoardCardRemoval } from "../../use-board-state";
export type BoardCardActionsProps = {
  actions: Node[];
  cardId: string;
  columnKey: string;
  "data-test"?: string;
  removeCard: (cardId: string) => BoardCardRemoval | null;
  restoreCard: (removal: BoardCardRemoval | null) => void;
};
export declare function BoardCardActions({
  actions,
  cardId,
  columnKey,
  "data-test": testId,
  removeCard,
  restoreCard,
}: BoardCardActionsProps): import("react").JSX.Element;
