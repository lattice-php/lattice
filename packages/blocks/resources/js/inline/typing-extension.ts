import { Extension, type Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { RefObject } from "react";
import { SLASH_MENU_PLUGIN_KEY } from "@lattice-php/form/rich-editor/block-menu/slash-extension";
import type { RichDocument } from "./typing";

export type RichTypingHandlers = {
  split: (before: RichDocument | null, after: RichDocument | null) => boolean;
  mergeBackward: (content: RichDocument | null) => boolean;
  arrow: (direction: "up" | "down") => boolean;
};

function isEmpty(node: ProseMirrorNode): boolean {
  return (
    node.childCount === 0 ||
    (node.childCount === 1 &&
      node.firstChild?.type.name === "paragraph" &&
      node.firstChild.content.size === 0)
  );
}

function toDocument(node: ProseMirrorNode): RichDocument | null {
  return isEmpty(node) ? null : (node.toJSON() as RichDocument);
}

/** While the slash menu is open its own key handling owns Enter and the arrows. */
function slashMenuOpen(editor: Editor): boolean {
  const state = SLASH_MENU_PLUGIN_KEY.getState(editor.state) as { active?: boolean } | undefined;

  return state?.active === true;
}

/**
 * Block-level keys for an inline rich-text editor: Enter in a top-level
 * paragraph splits the block, Backspace at the very start merges it into the
 * previous block, and the arrow keys leave the block at its first or last
 * line. Runs before the built-in keymaps, which would otherwise consume the
 * keys, and steps aside while the slash menu is open.
 */
export function createTypingExtension(handlers: RefObject<RichTypingHandlers | null>) {
  return Extension.create({
    name: "latticeBlockTyping",
    priority: 1001,

    addKeyboardShortcuts() {
      return {
        ArrowDown: ({ editor }) => {
          const { $from, empty } = editor.state.selection;

          if (
            slashMenuOpen(editor) ||
            !empty ||
            $from.index(0) !== editor.state.doc.childCount - 1 ||
            !editor.view.endOfTextblock("down")
          ) {
            return false;
          }

          return handlers.current?.arrow("down") ?? false;
        },
        ArrowUp: ({ editor }) => {
          const { $from, empty } = editor.state.selection;

          if (
            slashMenuOpen(editor) ||
            !empty ||
            $from.index(0) !== 0 ||
            !editor.view.endOfTextblock("up")
          ) {
            return false;
          }

          return handlers.current?.arrow("up") ?? false;
        },
        Backspace: ({ editor }) => {
          const { $from, empty } = editor.state.selection;

          if (!empty || $from.depth !== 1 || $from.index(0) !== 0 || $from.parentOffset !== 0) {
            return false;
          }

          return handlers.current?.mergeBackward(toDocument(editor.state.doc)) ?? false;
        },
        Enter: ({ editor }) => {
          const { $from, empty } = editor.state.selection;

          if (
            slashMenuOpen(editor) ||
            !empty ||
            $from.depth !== 1 ||
            $from.parent.type.name !== "paragraph"
          ) {
            return false;
          }

          const doc = editor.state.doc;

          return (
            handlers.current?.split(
              toDocument(doc.cut(0, $from.pos)),
              toDocument(doc.cut($from.pos)),
            ) ?? false
          );
        },
      };
    },
  });
}
