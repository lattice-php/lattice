import { useMemo } from "react";
import {
  insert,
  PARAGRAPH_TYPE,
  remove,
  replaceBlock,
  select,
  updateBoundDocument,
  updateBoundText,
} from "../document/store";
import { findBlock, visibleOrder } from "../document/tree";
import { useEditor } from "../components/editor/editor-context";
import { documentContent, textDocument, type RichDocument } from "./typing";

export type TypingHandlers = {
  /** Enter in the middle or at the end of the text: keep `before`, open a paragraph holding `after`. */
  splitRich: (before: RichDocument | null, after: RichDocument | null) => boolean;
  splitText: (before: string, after: string) => boolean;
  /** Backspace at the very start: hand the content to the previous block and leave. */
  mergeBackward: (content: RichDocument | null) => boolean;
  /** Arrow keys at the first or last line: move into the neighbouring block. */
  arrow: (direction: "up" | "down") => boolean;
  /** Slash menu: swap an empty block for another type, or add the type below. */
  insertType: (typeKey: string, replaceWhenEmpty: boolean) => void;
};

/**
 * The Gutenberg-style keyboard behaviours shared by every inline editor of a
 * block, expressed as document transitions plus focus hand-offs.
 */
export function useTypingHandlers(blockId: string, field: string): TypingHandlers {
  const { store, inline, focusBlock } = useEditor();

  return useMemo<TypingHandlers>(() => {
    const insertParagraphAfter = (data: Record<string, unknown>): string | null => {
      const entry = findBlock(store.getState().document, blockId);

      if (!entry) {
        return null;
      }

      let created: string | null = null;
      store.setState((state) => {
        const result = insert(
          state,
          PARAGRAPH_TYPE,
          { index: entry.index + 1, parentId: entry.parentId, slot: entry.slot },
          data,
        );
        created = result.id;

        return result.state;
      });

      if (created) {
        inline.requestFocus(created, "start");
      }

      return created;
    };

    const neighbour = (direction: "up" | "down"): string | null => {
      const order = visibleOrder(store.getState().document);
      const index = order.indexOf(blockId);

      return order[direction === "up" ? index - 1 : index + 1] ?? null;
    };

    const enter = (id: string, edge: "start" | "end") => {
      store.setState((state) => select(state, id));

      if (!inline.focusInline(id, edge)) {
        focusBlock(id);
      }
    };

    return {
      arrow: (direction) => {
        const target = neighbour(direction);

        if (target === null) {
          return false;
        }

        enter(target, direction === "up" ? "end" : "start");

        return true;
      },
      insertType: (typeKey, replaceWhenEmpty) => {
        const entry = findBlock(store.getState().document, blockId);

        if (!entry) {
          return;
        }

        let created: string | null = null;
        store.setState((state) => {
          const result = replaceWhenEmpty
            ? replaceBlock(state, blockId, typeKey)
            : insert(state, typeKey, {
                index: entry.index + 1,
                parentId: entry.parentId,
                slot: entry.slot,
              });
          created = result.id;

          return result.state;
        });

        if (created) {
          inline.requestFocus(created, "start");
          queueMicrotask(() => {
            if (created && !inline.hasInline(created)) {
              focusBlock(created);
            }
          });
        }
      },
      mergeBackward: (content) => {
        const previous = neighbour("up");

        if (previous === null) {
          return false;
        }

        const document = store.getState().document;
        const entry = findBlock(document, previous);
        const current = findBlock(document, blockId);
        const sameList =
          entry !== null &&
          current !== null &&
          current.parentId === entry.parentId &&
          current.slot === entry.slot;

        if (!sameList) {
          return false;
        }

        if (inline.appendTo(previous, documentContent(content))) {
          store.setState((state) => select(remove(state, blockId), previous));

          return true;
        }

        if (documentContent(content).length > 0) {
          return false;
        }

        store.setState((state) => select(remove(state, blockId), previous));
        enter(previous, "end");

        return true;
      },
      splitRich: (before, after) => {
        store.setState((state) => updateBoundDocument(state, blockId, field, before));

        return insertParagraphAfter({ content: after }) !== null;
      },
      splitText: (before, after) => {
        store.setState((state) => updateBoundText(state, blockId, field, before));

        return insertParagraphAfter({ content: textDocument(after) }) !== null;
      },
    };
  }, [blockId, field, focusBlock, inline, store]);
}
