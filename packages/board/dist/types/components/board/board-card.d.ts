import { Schema } from "@lattice-php/core";
import { BoardFocusDirection } from "../../board-keyboard";
import { BoardCard } from "../../board-store";
export type BoardCardItemProps = {
  canMove: boolean;
  card: BoardCard;
  cardId: string;
  columnKey: string;
  "data-test"?: string;
  moving: boolean;
  onFocus: () => void;
  onMoveFocus: (direction: BoardFocusDirection) => void;
  schema: Schema;
  tabIndex: -1 | 0;
};
export declare const BoardCardItem: import("react").ForwardRefExoticComponent<
  BoardCardItemProps & import("react").RefAttributes<HTMLLIElement>
>;
