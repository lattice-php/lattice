import { useCallback, useMemo, useRef, useState } from "react";
import { apiJson } from "@lattice-php/core";
import { addDays } from "@lattice-php/ui/format/plain-date";
import type { TimelineEventData } from "./types";

export type DateRange = readonly [string, string];

/** Sorts and coalesces overlapping or touching ranges into the fewest covering ranges. */
export function mergeRanges(ranges: readonly DateRange[]): DateRange[] {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const merged: [string, string][] = [[sorted[0][0], sorted[0][1]]];

  for (const [from, to] of sorted.slice(1)) {
    const last = merged[merged.length - 1];

    if (from <= last[1]) {
      if (to > last[1]) {
        last[1] = to;
      }
    } else {
      merged.push([from, to]);
    }
  }

  return merged;
}

/**
 * The gap(s) within [from, to) not covered by `loadedRanges`. Each returned
 * gap is itself half-open, so a caller can request exactly the missing slice.
 */
export function uncoveredGaps(
  loadedRanges: readonly DateRange[],
  from: string,
  to: string,
): DateRange[] {
  if (from >= to) {
    return [];
  }

  const merged = mergeRanges(loadedRanges);
  const gaps: DateRange[] = [];
  let cursor = from;

  for (const [rangeFrom, rangeTo] of merged) {
    if (rangeTo <= cursor) {
      continue;
    }

    if (rangeFrom >= to) {
      break;
    }

    if (rangeFrom > cursor) {
      gaps.push([cursor, rangeFrom]);
    }

    cursor = rangeTo > cursor ? (rangeTo < to ? rangeTo : to) : cursor;

    if (cursor >= to) {
      break;
    }
  }

  if (cursor < to) {
    gaps.push([cursor, to]);
  }

  return gaps;
}

export type UseTimelineEventsOptions = {
  endpoint: string | null;
  componentRef: string | null;
  initialEvents: TimelineEventData[];
  initialFrom: string;
  days: number;
};

export type UseTimelineEventsReturn = {
  events: Map<string, TimelineEventData>;
  eventsForResource: (resourceId: string) => TimelineEventData[];
  ensureRange: (from: string, to: string) => void;
  loading: boolean;
};

export function useTimelineEvents({
  endpoint,
  componentRef,
  initialEvents,
  initialFrom,
  days,
}: UseTimelineEventsOptions): UseTimelineEventsReturn {
  const [events, setEvents] = useState<Map<string, TimelineEventData>>(
    () => new Map(initialEvents.map((event) => [event.id, event])),
  );
  const [loading, setLoading] = useState(false);
  const loadedRangesRef = useRef<DateRange[]>([[initialFrom, addDays(initialFrom, days)]]);
  const inFlightRef = useRef<Map<string, Promise<void>>>(new Map());

  const ensureRange = useCallback(
    (from: string, to: string) => {
      if (!endpoint || !componentRef) {
        return;
      }

      const gaps = uncoveredGaps(loadedRangesRef.current, from, to);

      if (gaps.length === 0) {
        return;
      }

      const gapFrom = gaps[0][0];
      const gapTo = gaps[gaps.length - 1][1];
      const key = `${gapFrom}:${gapTo}`;

      if (inFlightRef.current.has(key)) {
        return;
      }

      const request = apiJson<{ events: TimelineEventData[] }>(
        `${endpoint}?from=${gapFrom}&to=${gapTo}`,
        { ref: componentRef },
      )
        .then(({ events: fetched }) => {
          loadedRangesRef.current = mergeRanges([...loadedRangesRef.current, [gapFrom, gapTo]]);
          setEvents((current) => {
            const next = new Map(current);

            for (const event of fetched) {
              next.set(event.id, event);
            }

            return next;
          });
        })
        .catch(() => {})
        .finally(() => {
          inFlightRef.current.delete(key);
          setLoading(inFlightRef.current.size > 0);
        });

      inFlightRef.current.set(key, request);
      setLoading(true);
    },
    [componentRef, endpoint],
  );

  const eventsForResource = useCallback(
    (resourceId: string) => {
      const list: TimelineEventData[] = [];

      for (const event of events.values()) {
        if (event.resourceId === resourceId) {
          list.push(event);
        }
      }

      return list;
    },
    [events],
  );

  return useMemo(
    () => ({ events, eventsForResource, ensureRange, loading }),
    [events, eventsForResource, ensureRange, loading],
  );
}
