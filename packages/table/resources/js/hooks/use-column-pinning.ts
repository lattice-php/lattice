import { useCallback, useMemo } from "react";
import { usePersistentState } from "@lattice-php/ui/lib/use-persistent-state";

export type ColumnPinSide = "left" | "right";

export type PinnableColumn = {
  key: string;
  props: {
    pinned?: ColumnPinSide | null;
  };
};

export function useColumnPinning<TColumn extends PinnableColumn>({
  columns,
  storageKey,
}: {
  columns: TColumn[];
  storageKey?: string;
}) {
  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const columnsByKey = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  );

  const [overrides, setOverrides] = usePersistentState<Record<string, ColumnPinSide | false>>(
    storageKey ?? "",
    {},
    {
      enabled: Boolean(storageKey),
      parse: (raw) => parseStoredPins(raw, columnKeys),
      serialize: (value) => serializePins(value, columnKeys),
    },
  );

  const serverPinFor = useCallback(
    (column: PinnableColumn): ColumnPinSide | null => column.props.pinned ?? null,
    [],
  );

  const pinFor = useCallback(
    (column: TColumn): ColumnPinSide | null => {
      const override = overrides[column.key];

      if (override === undefined) {
        return serverPinFor(column);
      }

      return override === false ? null : override;
    },
    [overrides, serverPinFor],
  );

  const setColumnPin = useCallback(
    (key: string, side: ColumnPinSide | null) => {
      setOverrides((current) => {
        const column = columnsByKey.get(key);
        const serverPin = column ? serverPinFor(column) : null;
        const next = { ...current };

        if (side === serverPin) {
          delete next[key];
        } else if (side === null) {
          next[key] = false;
        } else {
          next[key] = side;
        }

        return next;
      });
    },
    [columnsByKey, serverPinFor, setOverrides],
  );

  const resetPins = useCallback(() => setOverrides({}), [setOverrides]);

  const hasPinOverrides = Object.keys(overrides).length > 0;

  return {
    hasPinOverrides,
    pinFor,
    resetPins,
    setColumnPin,
  };
}

function isValidPinValue(value: unknown): value is ColumnPinSide | false {
  return value === "left" || value === "right" || value === false;
}

function pickKnownPins(
  source: Record<string, unknown>,
  columnKeys: string[],
): Record<string, ColumnPinSide | false> {
  const known = new Set(columnKeys);
  const result: Record<string, ColumnPinSide | false> = {};

  for (const [key, value] of Object.entries(source)) {
    if (known.has(key) && isValidPinValue(value)) {
      result[key] = value;
    }
  }

  return result;
}

function parseStoredPins(raw: string, columnKeys: string[]): Record<string, ColumnPinSide | false> {
  const stored = JSON.parse(raw) as { overrides?: unknown };
  const overrides = stored?.overrides;

  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    throw new Error("unexpected stored column pins shape");
  }

  return pickKnownPins(overrides as Record<string, unknown>, columnKeys);
}

function serializePins(
  overrides: Record<string, ColumnPinSide | false>,
  columnKeys: string[],
): string | null {
  const stored = pickKnownPins(overrides, columnKeys);

  if (Object.keys(stored).length === 0) {
    return null;
  }

  return JSON.stringify({ overrides: stored });
}
