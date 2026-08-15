import { useCallback, useMemo, useRef, useState } from "react";
import { apiFetch, apiJson } from "@lattice-php/core";
import { mergeRanges, uncoveredGaps, type DateRange } from "./date-ranges";
import type { CalendarEventData, CalendarRescheduleRequest } from "./types";

export type UseCalendarEventsOptions = {
  endpoint: string | null;
  componentRef: string | null;
  initialEvents: CalendarEventData[];
  initialFrom: string;
  initialTo: string;
};

export type UseCalendarEventsReturn = {
  events: Map<string, CalendarEventData>;
  eventsForResource: (resourceId: string) => CalendarEventData[];
  ensureRange: (from: string, to: string) => void;
  isRescheduling: (id: string) => boolean;
  loading: boolean;
  reschedule: (
    request: CalendarRescheduleRequest,
  ) => Promise<{ accepted: boolean; message: string | null }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function eventFromResponse(value: unknown): CalendarEventData | null {
  if (!isRecord(value) || !isRecord(value.event)) {
    return null;
  }

  const event = value.event;

  if (
    typeof event.id !== "string" ||
    typeof event.start !== "string" ||
    typeof event.end !== "string" ||
    typeof event.label !== "string" ||
    typeof event.allDay !== "boolean"
  ) {
    return null;
  }

  return event as unknown as CalendarEventData;
}

function errorMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.errors)) {
    for (const messages of Object.values(value.errors)) {
      if (Array.isArray(messages)) {
        const message = messages.find(
          (candidate): candidate is string => typeof candidate === "string",
        );

        if (message) {
          return message;
        }
      }
    }
  }

  return typeof value.message === "string" && value.message !== "" ? value.message : null;
}

export function useCalendarEvents({
  endpoint,
  componentRef,
  initialEvents,
  initialFrom,
  initialTo,
}: UseCalendarEventsOptions): UseCalendarEventsReturn {
  const [events, setEvents] = useState<Map<string, CalendarEventData>>(
    () => new Map(initialEvents.map((event) => [event.id, event])),
  );
  const [loading, setLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState<Set<string>>(new Set());
  const loadedRangesRef = useRef<DateRange[]>([[initialFrom, initialTo]]);
  const inFlightRef = useRef<Map<string, Promise<void>>>(new Map());
  const reschedulingRef = useRef<Set<string>>(new Set());

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

      const request = apiJson<{ events: CalendarEventData[] }>(
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
      const list: CalendarEventData[] = [];

      for (const event of events.values()) {
        if (event.resourceId === resourceId) {
          list.push(event);
        }
      }

      return list;
    },
    [events],
  );

  const reschedule = useCallback(
    async (
      request: CalendarRescheduleRequest,
    ): Promise<{ accepted: boolean; message: string | null }> => {
      const previous = events.get(request.id);

      if (!endpoint || !componentRef || !previous || reschedulingRef.current.has(request.id)) {
        return { accepted: false, message: null };
      }

      reschedulingRef.current.add(request.id);
      setRescheduling(new Set(reschedulingRef.current));
      setEvents((current) => new Map(current).set(request.id, { ...previous, ...request }));

      try {
        const response = await apiFetch(endpoint, {
          body: JSON.stringify(request),
          method: "PATCH",
          ref: componentRef,
          throwOnError: false,
        });
        const body: unknown = await response.json().catch(() => null);
        const updated = response.ok ? eventFromResponse(body) : null;

        if (updated?.id === request.id) {
          setEvents((current) => new Map(current).set(request.id, updated));

          return { accepted: true, message: null };
        }

        setEvents((current) => new Map(current).set(previous.id, previous));

        return { accepted: false, message: errorMessage(body) };
      } catch {
        setEvents((current) => new Map(current).set(previous.id, previous));

        return { accepted: false, message: null };
      } finally {
        reschedulingRef.current.delete(request.id);
        setRescheduling(new Set(reschedulingRef.current));
      }
    },
    [componentRef, endpoint, events],
  );

  const isRescheduling = useCallback((id: string) => rescheduling.has(id), [rescheduling]);

  return useMemo(
    () => ({ events, eventsForResource, ensureRange, isRescheduling, loading, reschedule }),
    [events, eventsForResource, ensureRange, isRescheduling, loading, reschedule],
  );
}
