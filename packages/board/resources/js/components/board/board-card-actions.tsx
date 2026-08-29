import type { Node } from "@lattice-php/core";
import { Renderer } from "@lattice-php/core";
import { ActionsDropdown } from "@lattice-php/action";
import { useT } from "@lattice-php/ui/i18n";

export type BoardCardActionsProps = {
  actions: Node[];
  "data-test"?: string;
};

export function BoardCardActions({ actions, "data-test": testId }: BoardCardActionsProps) {
  const { t } = useT("board");
  const label = t("board.card-actions", "Card actions");

  return (
    <ActionsDropdown
      className="lt-board-card-actions"
      data-test={testId}
      label={label}
      sideOffset={4}
    >
      <Renderer nodes={actions} />
    </ActionsDropdown>
  );
}
