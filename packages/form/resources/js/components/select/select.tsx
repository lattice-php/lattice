import { Icon } from "@lattice-php/ui/icons";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import type { Color, Option } from "@lattice-php/core";
import { controlSurface } from "@lattice-php/ui/lib/control";
import { colorValue } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { useT } from "@lattice-php/ui/i18n";
import { Combobox } from "../../primitives/combobox";

export type MultiSelectItem = {
  color?: Color;
  label: string;
  value: string;
};

export type MultiSelectProps = {
  creatable?: boolean;
  emptyLabel?: string;
  loading?: boolean;
  locked?: boolean;
  multiple?: boolean;
  onCreate?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onRemove?: (value: string) => void;
  onSearch?: (query: string) => void;
  onSelect: (value: string) => void;
  options: Option[];
  placeholder?: string;
  renderOption?: (option: Option) => ReactNode;
  searchPlaceholder?: string;
  selectedItems: MultiSelectItem[];
  showSearch?: boolean;
  testId?: string;
  triggerClassName?: string;
  triggerProps?: ComponentProps<typeof Combobox>["triggerProps"];
};

export function MultiSelect({
  creatable = false,
  emptyLabel,
  loading = false,
  locked = false,
  multiple = false,
  onCreate,
  onOpenChange,
  onRemove,
  onSearch,
  onSelect,
  options,
  placeholder,
  renderOption,
  searchPlaceholder,
  selectedItems,
  showSearch = false,
  testId,
  triggerClassName,
  triggerProps,
}: MultiSelectProps) {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);

  return (
    <div>
      {multiple && selectedItems.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <span
              className="inline-flex items-center gap-1 rounded-lt-sm bg-lt-muted px-2 py-0.5 text-xs"
              key={item.value}
            >
              {item.color && (
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: colorValue(item.color) }}
                />
              )}
              {item.label}
              {!locked && (
                <button
                  aria-label={t("form.remove-option", "Remove {{label}}", { label: item.label })}
                  data-test={testId ? `${testId}-remove-${item.value}` : undefined}
                  className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-xs"
                  onClick={() => onRemove?.(item.value)}
                  type="button"
                >
                  <Icon name="x" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <Combobox
        creatable={creatable}
        emptyLabel={emptyLabel}
        loading={loading}
        multiple={multiple}
        onCommit={(value) => onCreate?.(value)}
        onCreate={(value) => onCreate?.(value)}
        onSearch={onSearch}
        onSelect={onSelect}
        open={open && !locked}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
        options={options}
        renderOption={renderOption}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
        selected={selectedItems.map((item) => item.value)}
        testId={testId}
        trigger={
          <>
            {!multiple && selectedItems.length > 0 ? (
              <span>{selectedItems[0]?.label}</span>
            ) : (
              <span className="text-lt-muted-fg">{placeholder}</span>
            )}
            <Icon name="chevrons-up-down" className="size-lt-icon-md shrink-0 text-lt-muted-fg" />
          </>
        }
        triggerClassName={
          triggerClassName
            ? cn(
                triggerClassName,
                "text-left aria-readonly:cursor-default disabled:cursor-not-allowed disabled:opacity-60",
              )
            : cn(controlSurface(), "flex items-center justify-between gap-2 text-left")
        }
        triggerProps={triggerProps}
      />
    </div>
  );
}
