import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useCallAction } from "@lattice-php/action";
import { useT } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import type { Board as BoardWireProps } from "../../generated";

export type QuickAddProps = {
  columnKey: string;
  createAction: NonNullable<BoardWireProps["createAction"]>;
  onCreated: () => void;
};

export function QuickAdd({ columnKey, createAction, onCreated }: QuickAddProps) {
  const { t } = useT("board");
  const runAction = useCallAction();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const collapse = useCallback(() => {
    setExpanded(false);
    setTitle("");
  }, []);

  const submit = useCallback(async () => {
    if (submitting) {
      return;
    }

    const trimmed = title.trim();

    if (trimmed === "") {
      return;
    }

    setSubmitting(true);
    const result = await runAction(createAction, { column: columnKey, title: trimmed });
    setSubmitting(false);

    if (result.ok) {
      setTitle("");
      onCreated();
      // The input is still `disabled` in this tick — React has not yet
      // committed `submitting: false` — so focusing now would be a no-op.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [columnKey, createAction, onCreated, runAction, submitting, title]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void submit();
      } else if (event.key === "Escape") {
        collapse();
      }
    },
    [collapse, submit],
  );

  /**
   * Disabling the input while a submit is in flight fires a synthetic blur —
   * collapsing here would race the post-submit refocus and drop the input
   * before the response even lands. Only a real "left the field" blur, with
   * nothing pending, collapses it.
   */
  const handleBlur = useCallback(() => {
    if (!submitting) {
      collapse();
    }
  }, [collapse, submitting]);

  if (!expanded) {
    return (
      <button
        className="mt-2 flex items-center gap-1.5 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg"
        data-test={`board-quick-add-${columnKey}`}
        onClick={() => setExpanded(true)}
        type="button"
      >
        <Icon aria-hidden="true" className="size-lt-icon-sm" name="plus" />
        {t("board.add-card", "Add card")}
      </button>
    );
  }

  return (
    <input
      autoFocus
      className="mt-2 w-full rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1.5 text-sm text-lt-fg outline-none focus-visible:ring-2 focus-visible:ring-lt-primary"
      data-test={`board-quick-add-${columnKey}-input`}
      disabled={submitting}
      onBlur={handleBlur}
      onChange={(event) => setTitle(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={t("board.add-card-placeholder", "Enter a title...")}
      ref={inputRef}
      value={title}
    />
  );
}
