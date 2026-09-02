import type { ReactNode, RefObject } from "react";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { announce } from "@lattice-php/lattice/dnd";
import { keyboardMoveTarget } from "../../dnd/keyboard-move";
import { duplicate, move, remove } from "../../document/store";
import { useEditor, useEditorState } from "./editor-context";

export function BlockToolbar({
  id,
  label,
  icon,
  handleRef,
  inlineToolbar = null,
}: {
  id: string;
  label: string;
  icon: string | null;
  handleRef: RefObject<HTMLButtonElement | null>;
  inlineToolbar?: ReactNode;
}) {
  const { t } = useT("blocks");
  const { store, types, focusBlock } = useEditor();
  const document = useEditorState((state) => state.document);
  const upTarget = keyboardMoveTarget(document, types, id, "up");
  const downTarget = keyboardMoveTarget(document, types, id, "down");

  const moveTo = (direction: "up" | "down") => {
    const target = direction === "up" ? upTarget : downTarget;

    if (!target) {
      return;
    }

    store.setState((state) => move(state, id, target));
    announce(t("blocks.editor.block-moved", "{{label}} moved", { label }));
    queueMicrotask(() => focusBlock(id));
  };

  return (
    <div
      className="lt-blocks-ui absolute -top-9 left-0 z-10 flex h-8 items-center gap-0.5 rounded-lt border border-lt-border bg-lt-popover px-1 text-lt-popover-fg shadow-lt-md"
      data-test={`block-toolbar-${id}`}
      role="toolbar"
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={t("blocks.editor.drag", "Drag {{label}}", { label })}
        data-test={`block-drag-${id}`}
        className="inline-flex size-7 cursor-grab items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-accent hover:text-lt-accent-fg"
      >
        <Icon name="grip-vertical" className="size-lt-icon-md" />
      </button>
      <IconButton
        icon="arrow-up"
        label={t("blocks.editor.move-up", "Move up")}
        disabled={!upTarget}
        onClick={() => moveTo("up")}
        data-test={`block-move-up-${id}`}
      />
      <IconButton
        icon="arrow-down"
        label={t("blocks.editor.move-down", "Move down")}
        disabled={!downTarget}
        onClick={() => moveTo("down")}
        data-test={`block-move-down-${id}`}
      />
      <span className="mx-1 h-4 w-px bg-lt-border" aria-hidden="true" />
      <span className="flex items-center gap-1.5 px-1.5 text-xs font-medium">
        {icon && <Icon name={icon} className="size-lt-icon-sm" />}
        {label}
      </span>
      {inlineToolbar && (
        <>
          <span className="mx-1 h-4 w-px bg-lt-border" aria-hidden="true" />
          <span className="flex items-center gap-0.5" data-test={`inline-toolbar-${id}`}>
            {inlineToolbar}
          </span>
        </>
      )}
      <span className="mx-1 h-4 w-px bg-lt-border" aria-hidden="true" />
      <IconButton
        icon="copy"
        label={t("blocks.editor.duplicate", "Duplicate")}
        onClick={() => store.setState((state) => duplicate(state, id))}
        data-test={`block-duplicate-${id}`}
      />
      <IconButton
        icon="trash-2"
        label={t("blocks.editor.remove", "Remove")}
        onClick={() => store.setState((state) => remove(state, id))}
        data-test={`block-remove-${id}`}
      />
    </div>
  );
}
