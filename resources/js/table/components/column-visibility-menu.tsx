import { Checkbox } from "@lattice-php/lattice/ui/checkbox";
import type { ToggleableColumn } from "../hooks/use-column-visibility";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/lattice/ui/popover";

export function ColumnVisibilityMenu({
  columns,
  hasHidden,
  isVisible,
  onReset,
  onToggle,
  processing,
  visibleColumnCount,
}: {
  columns: ToggleableColumn[];
  hasHidden: boolean;
  isVisible: (column: ToggleableColumn) => boolean;
  onReset: () => void;
  onToggle: (key: string, visible: boolean) => void;
  processing: boolean;
  visibleColumnCount: number;
}) {
  const { t } = useT("lattice");
  const columnsLabel = t("table.columns.label", "Columns");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={columnsLabel}
          data-test="table-columns-menu"
          className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lt-ring/50 data-[state=open]:bg-lt-muted data-[state=open]:text-lt-fg"
          disabled={processing}
        >
          <Icon name="columns-3" aria-hidden="true" className="size-lt-icon-md" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4">
        <div className="grid gap-3">
          {columns.map((column) => {
            const visible = isVisible(column);
            const lockedLast = visible && visibleColumnCount <= 1;

            return (
              <label key={column.key} className="flex items-center gap-2 text-base text-lt-fg">
                <Checkbox
                  data-test={`table-column-toggle-${column.key}`}
                  checked={visible}
                  disabled={lockedLast}
                  onCheckedChange={(next) => onToggle(column.key, next === true)}
                />
                <span>{column.props.label ?? column.key}</span>
              </label>
            );
          })}
          {hasHidden && (
            <button
              type="button"
              data-test="table-columns-reset"
              className="mt-1 justify-self-start text-sm text-lt-muted-fg hover:text-lt-fg"
              onClick={onReset}
            >
              {t("table.columns.reset", "Reset")}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
