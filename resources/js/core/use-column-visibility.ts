import { useCallback, useMemo, useState } from "react";

export type ToggleableColumn = {
  key: string;
  label?: string;
  toggleable?: boolean | null;
  hiddenByDefault?: boolean | null;
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
    () => columns.filter((column) => column.toggleable === true),
    [columns],
  );
  const toggleableKeys = useMemo(
    () => toggleableColumns.map((column) => column.key),
    [toggleableColumns],
  );

  const [overrides, setOverrides] = useState<Record<string, boolean>>(() =>
    readStoredVisibility(storageKey, toggleableKeys),
  );

  const isVisible = useCallback(
    (column: ToggleableColumn): boolean => {
      if (column.toggleable !== true) {
        return true;
      }

      return overrides[column.key] ?? column.hiddenByDefault !== true;
    },
    [overrides],
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => isVisible(column)),
    [columns, isVisible],
  );

  const setColumnVisible = useCallback(
    (key: string, visible: boolean) => {
      setOverrides((current) => {
        const next = { ...current, [key]: visible };
        writeStoredVisibility(storageKey, toggleableKeys, next);

        return next;
      });
    },
    [storageKey, toggleableKeys],
  );

  const resetVisibility = useCallback(() => {
    setOverrides({});
    writeStoredVisibility(storageKey, toggleableKeys, {});
  }, [storageKey, toggleableKeys]);

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

function readStoredVisibility(
  storageKey: string | undefined,
  toggleableKeys: string[],
): Record<string, boolean> {
  if (!storageKey || typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (raw === null) {
      return {};
    }

    const stored = JSON.parse(raw) as unknown;

    if (!isStoredColumnVisibility(stored)) {
      removeStoredVisibility(storageKey);

      return {};
    }

    const known = new Set(toggleableKeys);
    const overrides: Record<string, boolean> = {};

    for (const [key, value] of Object.entries(stored.overrides)) {
      if (known.has(key) && typeof value === "boolean") {
        overrides[key] = value;
      }
    }

    if (Object.keys(overrides).length === 0) {
      removeStoredVisibility(storageKey);
    }

    return overrides;
  } catch {
    removeStoredVisibility(storageKey);

    return {};
  }
}

function writeStoredVisibility(
  storageKey: string | undefined,
  toggleableKeys: string[],
  overrides: Record<string, boolean>,
): void {
  if (!storageKey || typeof window === "undefined") {
    return;
  }

  const known = new Set(toggleableKeys);
  const stored: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(overrides)) {
    if (known.has(key) && typeof value === "boolean") {
      stored[key] = value;
    }
  }

  if (Object.keys(stored).length === 0) {
    removeStoredVisibility(storageKey);

    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ columns: toggleableKeys, overrides: stored }),
    );
  } catch {
    return;
  }
}

function removeStoredVisibility(storageKey: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    return;
  }
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
