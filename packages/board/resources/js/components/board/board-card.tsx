import { forwardRef, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { materializeSchema, Renderer } from "@lattice-php/core";
import type { Schema } from "@lattice-php/core";
import { cn } from "@lattice-php/ui/lib/utils";
import { BOARD_FOCUS_KEYS, type BoardFocusDirection } from "../../board-keyboard";
import type { BoardCard } from "../../board-store";

export type BoardCardItemProps = {
  card: BoardCard;
  "data-test"?: string;
  onFocus: () => void;
  onMoveFocus: (direction: BoardFocusDirection) => void;
  schema: Schema;
  tabIndex: -1 | 0;
};

export const BoardCardItem = forwardRef<HTMLLIElement, BoardCardItemProps>(function BoardCardItem(
  { card, "data-test": testId, onFocus, onMoveFocus, schema, tabIndex },
  ref,
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>) => {
      const direction = BOARD_FOCUS_KEYS[event.key];

      if (!direction) {
        return;
      }

      event.preventDefault();
      onMoveFocus(direction);
    },
    [onMoveFocus],
  );

  return (
    <li
      className={cn(
        "lt-board-card rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary",
      )}
      data-test={testId}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      ref={ref}
      role="listitem"
      tabIndex={tabIndex}
    >
      <Renderer nodes={materializeSchema(schema, card)} />
    </li>
  );
});
