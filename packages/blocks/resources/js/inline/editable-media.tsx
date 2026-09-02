import type { Node } from "@lattice-php/core";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { BaseNode } from "../components/editor/editor-registry";
import { BindingPopover } from "./binding-popover";
import type { BlockBinding } from "./use-block-binding";

/** An image bound to a media field: the rendered picture, with the picker one click away. */
export function EditableMedia({ node, binding }: { node: Node; binding: BlockBinding }) {
  const { t } = useT("blocks");
  const hasMedia = node.type === "image";

  return (
    <BindingPopover binding={binding} className="group relative">
      <BaseNode node={node} />
      <span className="pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lt-full border border-lt-border bg-lt-popover px-2 py-0.5 text-[11px] font-medium text-lt-popover-fg shadow-lt-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[state=open]:opacity-100">
        <Icon name="image" className="size-lt-icon-sm" />
        {hasMedia
          ? t("blocks.editor.replace-image", "Replace image")
          : t("blocks.editor.choose-image", "Choose image")}
      </span>
    </BindingPopover>
  );
}
