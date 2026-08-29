import { useId } from "react";
import type { Schema } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { IconRenderer } from "@lattice-php/ui/icons";
import { Badge } from "@lattice-php/ui/components/badge/badge";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import type { BoardFocusDirection } from "../../board-keyboard";
import type { BoardColumnView } from "../../use-board-state";
import type { BoardColumnData } from "../../generated";
import { cardKey } from "../../board-store";
import { BoardCardItem } from "./board-card";

export type BoardColumnProps = {
  cardSchema: Schema;
  column: BoardColumnData;
  focusedCardId: string | null;
  onFocusCard: (cardId: string) => void;
  onLoadMore: () => void;
  onMoveFocus: (cardId: string, direction: BoardFocusDirection) => void;
  registerCardRef: (cardId: string, element: HTMLLIElement | null) => void;
  view: BoardColumnView;
};

export function BoardColumn({
  cardSchema,
  column,
  focusedCardId,
  onFocusCard,
  onLoadMore,
  onMoveFocus,
  registerCardRef,
  view,
}: BoardColumnProps) {
  const { t } = useT("board");
  const headingId = useId();
  const tone = toneProps(coerceColor(column.color ?? undefined) ?? namedColor("gray"));

  return (
    <section className="lt-board-column" data-test={`board-column-${column.key}`}>
      <header className="flex items-center gap-2 pb-2">
        {column.icon ? (
          <IconRenderer
            className={cn("size-lt-icon-md shrink-0", tone.className)}
            icon={column.icon}
          />
        ) : null}
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-lt-fg" id={headingId}>
          {column.label}
        </h3>
        <Badge
          aria-label={t("board.card-count", "{{count}} cards", { count: view.total })}
          className={tone.className}
          style={tone.style}
        >
          {view.total}
        </Badge>
      </header>
      <ul aria-labelledby={headingId} className="lt-board-column-list" role="list">
        {view.cards.map((card) => {
          const id = cardKey(card);

          return (
            <BoardCardItem
              card={card}
              data-test={`board-card-${id}`}
              key={id}
              onFocus={() => onFocusCard(id)}
              onMoveFocus={(direction) => onMoveFocus(id, direction)}
              ref={(element) => registerCardRef(id, element)}
              schema={cardSchema}
              tabIndex={focusedCardId === id ? 0 : -1}
            />
          );
        })}
      </ul>
      {view.cards.length === 0 && !view.loading ? (
        <p className="px-1 py-2 text-sm text-lt-muted-fg">{t("board.empty-column", "No cards")}</p>
      ) : null}
      {view.hasMore ? (
        <button
          className="mt-2 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg"
          disabled={view.loading}
          onClick={onLoadMore}
          type="button"
        >
          {t("board.load-more", "Load more")}
        </button>
      ) : null}
    </section>
  );
}
