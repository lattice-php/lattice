import { useCallback, useMemo } from "react";
import { usePersistentState } from "@lattice-php/lattice/lib/use-persistent-state";

export type ToggleableColumn = {
  key: string;
  props: {
    label?: string | null;
    toggleable?: boolean;
    hiddenByDefault?: boolean;
  };
};

type StoredColumnVisibility = {
  columns: string[];
  overrides: Record<string, boolean>;
};

export function useColumnVisibility<TColumn extends ToggleableColumn>({
  columns,
  storageKey,
}: {
  columns: TColumn[];
  storageKey?: string;
}) {
  const toggleableColumns = useMemo(
    () => columns.filter((column) => column.props.toggleable),
    [columns],
  );
  const toggleableKeys = useMemo(
    () => toggleableColumns.map((column) => column.key),
    [toggleableColumns],
  );

  const [overrides, setOverrides] = usePersistentState<Record<string, boolean>>(
    storageKey ?? "",
    {},
    {
      enabled: Boolean(storageKey),
      parse: (raw) => parseStoredVisibility(raw, toggleableKeys),
      serialize: (value) => serializeVisibility(value, toggleableKeys),
    },
  );

  const isVisible = useCallback(
    (column: ToggleableColumn): boolean => {
      if (!column.props.toggleable) {
        return true;
      }

      return overrides[column.key] ?? !column.props.hiddenByDefault;
    },
    [overrides],
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => isVisible(column)),
    [columns, isVisible],
  );

  const setColumnVisible = useCallback(
    (key: string, visible: boolean) => {
      setOverrides((current) => ({ ...current, [key]: visible }));
    },
    [setOverrides],
  );

  const resetVisibility = useCallback(() => setOverrides({}), [setOverrides]);

  const hasToggleableColumns = toggleableColumns.length > 0;
  const hasHidden = toggleableColumns.some((column) => !isVisible(column));

  return {
    hasHidden,
    hasToggleableColumns,
    isVisible,
    resetVisibility,
    setColumnVisible,
    toggleableColumns,
    visibleColumns,
  };
}

function pickKnownBooleans(
  source: Record<string, unknown>,
  toggleableKeys: string[],
): Record<string, boolean> {
  const known = new Set(toggleableKeys);
  const result: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(source)) {
    if (known.has(key) && typeof value === "boolean") {
      result[key] = value;
    }
  }

  return result;
}

function parseStoredVisibility(raw: string, toggleableKeys: string[]): Record<string, boolean> {
  const stored = JSON.parse(raw) as unknown;

  if (!isStoredColumnVisibility(stored)) {
    throw new Error("unexpected stored column visibility shape");
  }

  return pickKnownBooleans(stored.overrides, toggleableKeys);
}

function serializeVisibility(
  overrides: Record<string, boolean>,
  toggleableKeys: string[],
): string | null {
  const stored = pickKnownBooleans(overrides, toggleableKeys);

  if (Object.keys(stored).length === 0) {
    return null;
  }

  return JSON.stringify({ columns: toggleableKeys, overrides: stored });
}

function isStoredColumnVisibility(value: unknown): value is StoredColumnVisibility {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.columns) &&
    record.columns.every((column) => typeof column === "string") &&
    typeof record.overrides === "object" &&
    record.overrides !== null &&
    !Array.isArray(record.overrides)
  );
}
