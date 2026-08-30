import { lazyComponent, type Plugin } from "@lattice-php/lattice";
import { ToolbarIconButton, type RichEditorExtensionRegistry } from "@lattice-php/form/rich-editor";
import { StatusBadgeCell } from "./columns/status-badge";

export const appPlugin = {
  name: "workbench",
  components: {
    "echo-status": lazyComponent(() => import("./components/EchoStatus")),
  },
  extensions: {
    "form.rich-editor": {
      stamp: {
        toolbar: () => [
          {
            key: "stamp",
            component: ({ editor }) => (
              <ToolbarIconButton
                icon="check"
                label="Stamp"
                onClick={() => editor.chain().focus().insertContent("Stamped!").run()}
                testId="editor-stamp"
              />
            ),
          },
        ],
        commands: () => [
          {
            icon: "check",
            key: "stamp",
            label: "Stamp",
            run: (editor) => editor.chain().focus().insertContent("Stamped!").run(),
          },
        ],
      },
    } satisfies RichEditorExtensionRegistry,
    "table.columns": {
      "column.status-badge": StatusBadgeCell,
    },
  },
} satisfies Plugin;
