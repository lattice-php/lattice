import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion, type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import type { RefObject } from "react";
import type { BlockCommandEntry } from "../registry";

export const SLASH_MENU_PLUGIN_KEY = new PluginKey("latticeSlashMenu");

export type SlashMenuSuggestionProps = SuggestionProps<BlockCommandEntry, BlockCommandEntry>;

/**
 * The React side of the slash menu, populated by BlockMenuController. The
 * suggestion plugin only ever talks to this ref, so the tiptap extension stays
 * referentially stable across re-renders and the editor is never rebuilt.
 */
export type SlashMenuHandle = {
  onStart: (props: SlashMenuSuggestionProps) => void;
  onUpdate: (props: SlashMenuSuggestionProps) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onExit: () => void;
};

export function createSlashMenuExtension(options: {
  commands: () => BlockCommandEntry[];
  handle: RefObject<SlashMenuHandle | null>;
  char?: string;
}) {
  return Extension.create({
    name: "latticeSlashMenu",

    addProseMirrorPlugins() {
      return [
        Suggestion<BlockCommandEntry, BlockCommandEntry>({
          editor: this.editor,
          pluginKey: SLASH_MENU_PLUGIN_KEY,
          char: options.char ?? "/",
          allow: ({ editor }) => !editor.isActive("codeBlock"),
          items: () => options.commands(),
          command: ({ editor, range, props }) => {
            editor.chain().focus().deleteRange(range).run();
            props.run(editor);
          },
          render: () => ({
            onStart: (props) => options.handle.current?.onStart(props),
            onUpdate: (props) => options.handle.current?.onUpdate(props),
            onKeyDown: (props) => options.handle.current?.onKeyDown(props) ?? false,
            onExit: () => options.handle.current?.onExit(),
          }),
        }),
      ];
    },
  });
}
