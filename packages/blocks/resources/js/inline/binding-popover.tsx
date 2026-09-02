import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/ui/components/popover/popover";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { updateData } from "../document/store";
import { findBlock } from "../document/tree";
import { useEditor, useEditorState } from "../components/editor/editor-context";
import { FieldEmbed } from "../components/inspector/field-embed";
import type { BlockBinding } from "./use-block-binding";

/**
 * Edits a bound field that has no inline control of its own (selects, toggles,
 * numbers, media) in a popover anchored to the element that shows it.
 */
export function BindingPopover({
  binding,
  children,
  className,
}: {
  binding: BlockBinding;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useT("blocks");
  const { store, requestRender } = useEditor();
  const { block, field } = binding;
  const [open, setOpen] = useState(false);
  const data = useEditorState((state) => findBlock(state.document, block.id)?.node.data);
  const errors = useEditorState((state) => state.errors[block.id]);
  const fieldLabel = (field.node.props as { label?: string | null }).label ?? field.name;
  const [initial] = useState(() => data ?? {});

  const onChange = useCallback(
    (name: string, value: unknown) => {
      store.setState((state) => updateData(state, block.id, name, value));
      requestRender(block.id);
    },
    [block.id, requestRender, store],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          aria-label={t("blocks.editor.edit-field", "Edit {{label}}", { label: fieldLabel })}
          data-test={`inline-${block.id}-${field.name}`}
          className={cn(
            "lt-blocks-ui block cursor-pointer rounded-lt outline-none ring-lt-primary ring-offset-2 ring-offset-lt-surface focus-visible:ring-2 data-[state=open]:ring-2",
            className,
          )}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="lt-blocks-ui w-80 p-3"
        data-test={`inline-popover-${block.id}-${field.name}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
          }
        }}
      >
        <FieldEmbed
          id={`${block.id}-${field.name}`}
          schema={[field.node]}
          initial={initial}
          errors={errors}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}
