import type { Editor } from "@tiptap/core";
import type { BlockCommandEntry } from "../registry";

export function filterBlockCommands(
  commands: BlockCommandEntry[],
  query: string,
  editor: Editor,
  translate: (key: string, fallback: string) => string,
): BlockCommandEntry[] {
  const needle = query.trim().toLowerCase();

  return commands.filter((command) => {
    if (command.isAvailable && !command.isAvailable(editor)) {
      return false;
    }

    if (needle === "") {
      return true;
    }

    return [
      translate(command.key, command.label),
      command.label,
      command.key,
      ...(command.keywords ?? []),
    ].some((value) => value.toLowerCase().includes(needle));
  });
}
