import { useEffect, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import type { InlineEdge, InlineHandle } from "../components/editor/focus-registry";

export type InlineTextProps = {
  value: string;
  placeholder?: string | null;
  multiline?: boolean;
  className?: string;
  testId: string;
  label: string;
  onChange: (value: string) => void;
  /** Enter (without Shift): return true when the key was consumed. */
  onEnter?: (before: string, after: string) => boolean;
  /** Backspace in an empty editor: return true when the key was consumed. */
  onBackspaceEmpty?: () => boolean;
  /** Arrow up on the first line or down on the last: return true when the key was consumed. */
  onArrow?: (direction: "up" | "down") => boolean;
  handle?: (handle: InlineHandle | null) => void;
};

function caretOffset(element: HTMLElement): number {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return element.textContent?.length ?? 0;
  }

  const range = selection.getRangeAt(0).cloneRange();
  range.selectNodeContents(element);
  range.setEnd(selection.getRangeAt(0).startContainer, selection.getRangeAt(0).startOffset);

  return range.toString().length;
}

function placeCaret(element: HTMLElement, edge: InlineEdge): void {
  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(edge === "start");
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Whether the caret sits on the first (up) or last (down) visual line of a multi-line editor. */
function caretAtEdge(element: HTMLElement, direction: "up" | "down"): boolean {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || element.textContent === "") {
    return true;
  }

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const bounds = element.getBoundingClientRect();
  const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight) || 20;

  return direction === "up"
    ? rect.top - bounds.top < lineHeight
    : bounds.bottom - rect.bottom < lineHeight;
}

/**
 * A plain-text contenteditable that keeps the surrounding typography: the
 * DOM owns the caret while typing, the store value wins whenever it changes
 * from elsewhere (undo, a server render).
 */
export function InlineText({
  value,
  placeholder,
  multiline = false,
  className,
  testId,
  label,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onArrow,
  handle,
}: InlineTextProps) {
  const element = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const current = element.current;

    if (current && (current.textContent ?? "") !== value) {
      current.textContent = value;
    }
  }, [value]);

  useEffect(() => {
    if (!handle) {
      return;
    }

    handle({
      focus: (edge) => {
        const current = element.current;

        if (current) {
          current.focus();
          placeCaret(current, edge);
        }
      },
    });

    return () => handle(null);
  }, [handle]);

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const current = event.currentTarget;
    const text = current.textContent ?? "";

    if (event.key === "Enter") {
      if (event.shiftKey && multiline) {
        return;
      }

      event.preventDefault();
      const offset = caretOffset(current);
      onEnter?.(text.slice(0, offset), text.slice(offset));

      return;
    }

    if (event.key === "Backspace" && text === "" && onBackspaceEmpty?.()) {
      event.preventDefault();

      return;
    }

    if (
      (event.key === "ArrowUp" || event.key === "ArrowDown") &&
      !event.altKey &&
      !event.shiftKey
    ) {
      const direction = event.key === "ArrowUp" ? "up" : "down";

      if ((!multiline || caretAtEdge(current, direction)) && onArrow?.(direction)) {
        event.preventDefault();
      }
    }
  };

  return (
    <span
      ref={element}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      aria-multiline={multiline}
      data-test={testId}
      data-placeholder={placeholder ?? undefined}
      className={cn(
        "lt-blocks-inline lt-blocks-ui block min-w-4 cursor-text outline-none",
        multiline && "whitespace-pre-wrap",
        className,
      )}
      spellCheck
      onInput={(event) => onChange(event.currentTarget.textContent ?? "")}
      onKeyDown={onKeyDown}
    />
  );
}
