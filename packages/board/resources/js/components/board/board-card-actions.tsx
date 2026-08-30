import { useCallback, useRef } from "react";
import type { Node } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core";
import { ActionsDropdown } from "@lattice-php/action";
import {
  ActionNodeOptionsProvider,
  type ActionSubmitOptions,
} from "@lattice-php/ui/click-behavior";
import { useT } from "@lattice-php/ui/i18n";
import type { BoardCardRemoval } from "../../use-board-state";

export type BoardCardActionsProps = {
  actions: Node[];
  cardId: string;
  columnKey: string;
  "data-test"?: string;
  removeCard: (cardId: string) => BoardCardRemoval | null;
  restoreCard: (removal: BoardCardRemoval | null) => void;
};

export function BoardCardActions({
  actions,
  cardId,
  columnKey,
  "data-test": testId,
  removeCard,
  restoreCard,
}: BoardCardActionsProps) {
  const { t } = useT("board");
  const label = t("board.card-actions", "Card actions");
  const removalRef = useRef<BoardCardRemoval | null>(null);

  const resolveOptions = useCallback(
    (node: Node): ActionSubmitOptions | undefined => {
      const extraData = () => ({ cardId, columnKey });

      if (node.props?.removesRecord !== true) {
        return { extraData };
      }

      return {
        extraData,
        onBefore: () => {
          removalRef.current = removeCard(cardId);
        },
        onError: () => {
          restoreCard(removalRef.current);
          removalRef.current = null;
        },
      };
    },
    [cardId, columnKey, removeCard, restoreCard],
  );

  return (
    <ActionsDropdown
      className="lt-board-card-actions"
      data-test={testId}
      label={label}
      sideOffset={4}
    >
      <ActionNodeOptionsProvider resolve={resolveOptions}>
        <Renderer nodes={actions} />
      </ActionNodeOptionsProvider>
    </ActionsDropdown>
  );
}
