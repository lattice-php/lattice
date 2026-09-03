import { useMemo } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { announce } from "@lattice-php/lattice/dnd";
import { insert, insertPattern as insertPatternInto, type EditorStore } from "../../document/store";
import type { BlockTarget, BlockTypeData } from "../../types";
import type { InlineFocus } from "./focus-registry";

export type InsertFocus = "block" | "inline" | "none";

export type InsertOptions = {
  data?: Record<string, unknown>;
  /** Where the caret goes afterwards: the block itself, its first inline editor, or nowhere. */
  focus?: InsertFocus;
};

export type InsertActions = {
  /** Insert one block, fetch its render, announce it and move focus; null when the slot refuses it. */
  insertBlock: (typeKey: string, target: BlockTarget, options?: InsertOptions) => string | null;
  /** Insert a pattern's blocks the same way; empty when the target refuses any of them. */
  insertPattern: (key: string, target: BlockTarget) => string[];
};

/**
 * Every way of adding blocks — library click, insert menu, drop, Enter in a
 * paragraph, slash menu — ends the same way: the new block renders, screen
 * readers hear about it and focus lands on it. This is that ending, once.
 */
export function useInsertActions({
  store,
  types,
  requestRender,
  focusBlock,
  inline,
}: {
  store: EditorStore;
  types: readonly BlockTypeData[];
  requestRender: (id: string) => void;
  focusBlock: (id: string) => void;
  inline: InlineFocus;
}): InsertActions {
  const { t } = useT("blocks");

  return useMemo<InsertActions>(() => {
    const settle = (id: string, focus: InsertFocus) => {
      if (focus === "inline") {
        inline.requestFocus(id, "start");
      }

      if (focus !== "none") {
        queueMicrotask(() => {
          if (focus === "block" || !inline.hasInline(id)) {
            focusBlock(id);
          }
        });
      }
    };

    return {
      insertBlock: (typeKey, target, options = {}) => {
        let created: string | null = null;

        store.setState((state) => {
          const result = insert(state, typeKey, target, options.data);
          created = result.id;

          return result.state;
        });

        if (created === null) {
          return null;
        }

        requestRender(created);
        announce(
          t("blocks.editor.block-added", "{{label}} added", {
            label: types.find((type) => type.type === typeKey)?.label ?? typeKey,
          }),
        );
        settle(created, options.focus ?? "block");

        return created;
      },
      insertPattern: (key, target) => {
        let created: string[] = [];

        store.setState((state) => {
          const result = insertPatternInto(state, key, target);
          created = result.ids;

          return result.state;
        });

        const first = created[0];

        if (first === undefined) {
          return [];
        }

        created.forEach(requestRender);
        announce(
          t("blocks.editor.pattern-added", "{{label}} added", {
            label: store.getState().patterns.find((pattern) => pattern.key === key)?.label ?? key,
          }),
        );
        settle(first, "block");

        return created;
      },
    };
  }, [focusBlock, inline, requestRender, store, t, types]);
}
