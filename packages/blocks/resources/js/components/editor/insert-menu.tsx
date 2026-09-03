import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { allowedTypesFor } from "../../document/rules";
import type { BlockTarget } from "../../types";
import { useEditor, useEditorState } from "./editor-context";

export function InsertMenu({
  target,
  label,
  compact = false,
}: {
  target: BlockTarget;
  label: string;
  compact?: boolean;
}) {
  const { types, insertBlock } = useEditor();
  const document = useEditorState((state) => state.document);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const allowed = allowedTypesFor(document, types, target.parentId, target.slot);
  const testId = `insert-${target.parentId ?? "root"}-${target.slot ?? "root"}`;

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", close);

    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  const add = (typeKey: string) => {
    setOpen(false);
    insertBlock(typeKey, target);
  };

  if (allowed.length === 0) {
    return null;
  }

  return (
    <div
      ref={root}
      className={cn("lt-blocks-ui relative flex justify-center", compact ? "py-1" : "py-3")}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        data-test={testId}
        className={cn(
          "inline-flex items-center gap-1 rounded-lt-full border border-dashed border-lt-border px-3 text-sm text-lt-muted-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none",
          compact ? "h-7" : "h-8",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="plus" className="size-lt-icon-sm" />
        {!compact && <span>{label}</span>}
      </button>
      {open && (
        <ul
          id={menuId}
          role="menu"
          data-test={`${testId}-menu`}
          className="absolute top-full z-20 mt-1 grid w-64 grid-cols-2 gap-1 rounded-lt border border-lt-border bg-lt-popover p-1 shadow-lt-md"
        >
          {allowed.map((type) => (
            <li key={type.type} role="none">
              <button
                type="button"
                role="menuitem"
                data-test={`${testId}-${type.type}`}
                className="flex w-full flex-col items-center gap-1 rounded-lt-sm px-2 py-2 text-xs text-lt-popover-fg hover:bg-lt-accent hover:text-lt-accent-fg"
                onClick={() => add(type.type)}
              >
                {type.icon && <Icon name={type.icon} className="size-lt-icon-md" />}
                <span>{type.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
