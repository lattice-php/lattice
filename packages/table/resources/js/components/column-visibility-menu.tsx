import { Checkbox } from "@lattice-php/form/components/checkbox/checkbox";
import type { Side } from "@lattice-php/ui";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { useT } from "@lattice-php/ui/i18n";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/ui/components/popover/popover";
import type { TableColumn } from "@lattice-php/table/types";

export function ColumnVisibilityMenu({
  columns,
  hasHidden,
  hasPinOverrides = false,
  isVisible,
  onReset,
  onSetPin,
  onToggle,
  pinFor,
  pinningEnabled = false,
  processing,
  visibleColumnCount,
}: {
  columns: TableColumn[];
  hasHidden: boolean;
  hasPinOverrides?: boolean;
  isVisible: (column: TableColumn) => boolean;
  onReset: () => void;
  onSetPin?: (key: string, side: Side | null) => void;
  onToggle: (key: string, visible: boolean) => void;
  pinFor?: (column: TableColumn) => Side | null;
  pinningEnabled?: boolean;
  processing: boolean;
  visibleColumnCount: number;
}) {
  const { t } = useT("lattice");
  const columnsLabel = t("table.columns.label", "Columns");
  const pinLeftLabel = t("table.columns.pin-left", "Pin left");
  const pinRightLabel = t("table.columns.pin-right", "Pin right");
  const unpinLabel = t("table.columns.unpin", "Unpin");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          size="sm"
          icon="columns-3"
          label={columnsLabel}
          data-test="table-columns-menu"
          disabled={processing}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="grid gap-3">
          {columns.map((column) => {
            const toggleable = column.props.toggleable === true;
            const visible = isVisible(column);
            const lockedLast = toggleable && visible && visibleColumnCount <= 1;
            const pin = pinningEnabled ? (pinFor?.(column) ?? null) : null;

            return (
              <div key={column.key} className="flex items-center gap-2 text-base text-lt-fg">
                {toggleable ? (
                  <label className="flex flex-1 items-center gap-2">
                    <Checkbox
                      data-test={`table-column-toggle-${column.key}`}
                      checked={visible}
                      disabled={lockedLast}
                      onCheckedChange={(next) => onToggle(column.key, next === true)}
                    />
                    <span>{column.props.label ?? column.key}</span>
                  </label>
                ) : (
                  <span className="flex-1">{column.props.label ?? column.key}</span>
                )}
                {pinningEnabled && (
                  <div className="flex items-center gap-0.5">
                    <IconButton
                      icon="arrow-left-to-line"
                      label={pin === "start" ? unpinLabel : pinLeftLabel}
                      active={pin === "start"}
                      data-test={`table-column-pin-left-${column.key}`}
                      size="xs"
                      onClick={() => onSetPin?.(column.key, pin === "start" ? null : "start")}
                    />
                    <IconButton
                      icon="arrow-right-to-line"
                      label={pin === "end" ? unpinLabel : pinRightLabel}
                      active={pin === "end"}
                      data-test={`table-column-pin-right-${column.key}`}
                      size="xs"
                      onClick={() => onSetPin?.(column.key, pin === "end" ? null : "end")}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {(hasHidden || hasPinOverrides) && (
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
