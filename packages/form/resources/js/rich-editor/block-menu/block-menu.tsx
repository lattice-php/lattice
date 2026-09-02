import { Fragment, useEffect, useRef } from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { POPOVER_SURFACE } from "@lattice-php/ui/components/popover/popover";
import type { BlockCommandEntry } from "../registry";

export function blockOptionDomId(menuId: string, key: string): string {
  return `${menuId}-option-${key}`;
}

export function BlockMenu({
  activeIndex,
  id,
  items,
  onHighlight,
  onSelect,
  translate,
}: {
  activeIndex: number;
  id: string;
  items: BlockCommandEntry[];
  onHighlight: (index: number) => void;
  onSelect: (item: BlockCommandEntry) => void;
  translate?: (key: string, fallback: string) => string;
}) {
  const { t } = useT("lattice");
  const listRef = useRef<HTMLDivElement>(null);
  const label = translate ?? ((key: string, fallback: string) => t(`form.editor.${key}`, fallback));

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, items]);

  return (
    <div
      aria-label={t("form.editor.block-menu", "Insert block")}
      className={cn(POPOVER_SURFACE, "max-h-72 w-56 overflow-y-auto p-1")}
      data-test="editor-block-menu"
      id={id}
      ref={listRef}
      role="listbox"
    >
      {items.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-lt-muted-fg">
          {t("form.editor.block-menu-empty", "No results")}
        </div>
      ) : (
        items.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && items[index - 1].group !== item.group && (
              <div className="mx-1 my-1 h-px bg-lt-border" />
            )}
            <button
              aria-selected={index === activeIndex}
              className={cn(
                "flex w-full items-center gap-2 rounded-lt-sm px-2 py-1.5 text-left text-sm",
                index === activeIndex && "bg-lt-accent text-lt-accent-fg",
              )}
              data-test={`editor-block-${item.key}`}
              id={blockOptionDomId(id, item.key)}
              onClick={() => onSelect(item)}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => onHighlight(index)}
              role="option"
              type="button"
            >
              <Icon className="shrink-0 text-lt-muted-fg" name={item.icon} />
              {label(item.key, item.label)}
            </button>
          </Fragment>
        ))
      )}
    </div>
  );
}
