import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { announce, draggable, dropTargetForElements } from "@lattice-php/lattice/dnd";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import {
  addDays,
  addWallMinutes,
  daysBetween,
  formatWallTime,
  startOfWeekISO,
  wallMinutesOfDay,
} from "@lattice-php/ui/format/temporal";
import { weekChips } from "../month-grid";
import { eventDaySpan, shiftEventDays } from "../event-span";
import {
  belongsInAllDayRow,
  eventDurationMinutes,
  layoutDayColumns,
  MINUTES_PER_DAY,
  minuteToWallTime,
  SNAP_MINUTES,
  snapMinute,
  timedSegmentsOnDay,
} from "../time-grid";
import { useAnnouncedReschedule } from "../use-announced-reschedule";
import type { MonthChip } from "../month-grid";
import type { PositionedSegment } from "../time-grid";
import type { UseCalendarEventsReturn } from "../calendar-state";
import type { CalendarEventData, CalendarRescheduleRequest } from "../types";

const MOVE_DRAG_TYPE = "lattice-calendar-timegrid-event";
const RESIZE_DRAG_TYPE = "lattice-calendar-timegrid-resize";
const DAY_DRAG_TYPE = "lattice-calendar-timegrid-day-event";
const SCROLL_TO_HOUR = 7;

type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;

export type TimeGridViewProps = {
  canReschedule: boolean;
  dayCount: number;
  from: string;
  locale: string;
  onDayClick: ((date: string) => void) | null;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onNavigate: (from: string) => void;
  state: UseCalendarEventsReturn;
  t: Translate;
  today: string;
};

function toNoonUtc(dateISO: string): Date {
  return new Date(`${dateISO}T12:00:00Z`);
}

/** Minutes since local midnight, for the now indicator. */
function currentWallMinutes(): number {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

function minuteFromPointer(clientY: number, column: Element): number {
  const rect = column.getBoundingClientRect();

  return ((clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
}

export function TimeGridView({
  canReschedule,
  dayCount,
  from,
  locale,
  onDayClick,
  onEventClick,
  onNavigate,
  state,
  t,
  today,
}: TimeGridViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { events, isRescheduling, loading, reschedule } = state;
  const { submitReschedule } = useAnnouncedReschedule(events, reschedule, t);

  const gridStart = dayCount === 1 ? from : startOfWeekISO(from, locale);
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, index) => addDays(gridStart, index)),
    [dayCount, gridStart],
  );
  const eventList = useMemo(() => [...events.values()], [events]);
  const allDayEvents = useMemo(() => eventList.filter(belongsInAllDayRow), [eventList]);
  const { chips: allDayChips } = useMemo(
    () => weekChips(allDayEvents, gridStart, dayCount),
    [allDayEvents, gridStart, dayCount],
  );

  const title = useMemo(() => {
    if (dayCount === 1) {
      return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(toNoonUtc(gridStart));
    }

    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).formatRange(toNoonUtc(gridStart), toNoonUtc(addDays(gridStart, dayCount - 1)));
  }, [dayCount, gridStart, locale]);

  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
    [locale],
  );
  const hourFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
    [locale],
  );
  const hourLabels = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) =>
        hourFormatter.format(new Date(Date.UTC(2026, 0, 1, hour))),
      ),
    [hourFormatter],
  );

  useEffect(() => {
    const element = scrollRef.current;

    if (element) {
      element.scrollTop = (element.scrollHeight * SCROLL_TO_HOUR) / 24;
    }
  }, []);

  useEffect(() => {
    const pending = pendingFocusRef.current;

    if (!pending) {
      return;
    }

    const block = containerRef.current?.querySelector<HTMLElement>(
      `[data-test="calendar-event-${pending}"]`,
    );

    if (block) {
      pendingFocusRef.current = null;
      block.focus();
    }
  });

  const submitAndRefocus = useCallback(
    (request: CalendarRescheduleRequest): void => {
      pendingFocusRef.current = request.id;
      void submitReschedule(request);
    },
    [submitReschedule],
  );

  // The resize handle keeps its own focus across the re-render (its block
  // never remounts), so refocusing the block would break repeated key presses.
  const submitResize = useCallback(
    (request: CalendarRescheduleRequest): void => {
      void submitReschedule(request);
    },
    [submitReschedule],
  );

  const onMoveDrop = useCallback(
    (data: Record<string | symbol, unknown>, date: string, startMin: number): void => {
      const id = data.id;

      if (typeof id !== "string") {
        return;
      }

      const event = events.get(id);

      if (!event) {
        return;
      }

      const duration = eventDurationMinutes(event);
      const start = minuteToWallTime(date, startMin);

      if (start === event.start) {
        return;
      }

      void submitReschedule({
        id: event.id,
        resourceId: event.resourceId,
        start,
        end: addWallMinutes(start, duration),
      });
    },
    [events, submitReschedule],
  );

  const onResizeDrop = useCallback(
    (data: Record<string | symbol, unknown>, endMin: number): void => {
      const id = data.id;

      if (typeof id !== "string") {
        return;
      }

      const event = events.get(id);

      if (!event) {
        return;
      }

      const date = event.start.slice(0, 10);
      const startMin = wallMinutesOfDay(event.start);
      const bounded = Math.max(startMin + SNAP_MINUTES, endMin);
      const end = minuteToWallTime(date, bounded);

      if (end === event.end) {
        return;
      }

      void submitReschedule({
        id: event.id,
        resourceId: event.resourceId,
        start: event.start,
        end,
      });
    },
    [events, submitReschedule],
  );

  const onDayShiftDrop = useCallback(
    (data: Record<string | symbol, unknown>, date: string): void => {
      const id = data.id;
      const grabOffsetDays = typeof data.grabOffsetDays === "number" ? data.grabOffsetDays : 0;

      if (typeof id !== "string") {
        return;
      }

      const event = events.get(id);

      if (!event) {
        return;
      }

      const [dayStart] = eventDaySpan(event);
      const deltaDays = daysBetween(dayStart, addDays(date, -grabOffsetDays));

      if (deltaDays === 0) {
        return;
      }

      void submitReschedule({
        id: event.id,
        resourceId: event.resourceId,
        ...shiftEventDays(event, deltaDays),
      });
    },
    [events, submitReschedule],
  );

  const nowMinutes = currentWallMinutes();

  return (
    <div
      className="lt-calendar-timegrid"
      data-dragging={dragging ? "true" : undefined}
      ref={containerRef}
      style={{ "--lt-calendar-timegrid-days": dayCount } as CSSProperties}
    >
      <div className="mb-2 flex items-center gap-1">
        <button
          aria-label={t("calendar.previous", "Previous")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => onNavigate(addDays(gridStart, -dayCount))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-left" />
        </button>
        <button
          aria-label={t("calendar.next", "Next")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => onNavigate(addDays(gridStart, dayCount))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-right" />
        </button>
        <button
          className="rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted"
          onClick={() => onNavigate(today)}
          type="button"
        >
          {t("calendar.today", "Today")}
        </button>
        <h2 aria-live="polite" className="ml-2 text-sm font-semibold">
          {title}
        </h2>
      </div>

      <div
        aria-busy={loading || [...events.keys()].some((id) => isRescheduling(id))}
        aria-label={title}
        className="overflow-hidden rounded-lt-sm border border-lt-border"
      >
        <div className="lt-calendar-timegrid-row border-b border-lt-border">
          <div />
          {days.map((date) => (
            <div
              className={cn(
                "flex items-baseline gap-1.5 border-l border-lt-border px-2 py-1.5 text-xs",
                date === today ? "font-semibold text-lt-primary" : "text-lt-muted-fg",
              )}
              key={date}
            >
              <span>{weekdayFormatter.format(toNoonUtc(date))}</span>
              <span className="text-sm">{Number(date.slice(8, 10))}</span>
            </div>
          ))}
        </div>

        <div className="lt-calendar-timegrid-row border-b border-lt-border">
          <div className="px-2 py-1 text-right text-[0.65rem] text-lt-muted-fg">
            {t("calendar.all-day", "All day")}
          </div>
          <div className="lt-calendar-timegrid-allday" style={{ gridColumn: "2 / -1" }}>
            <div className="lt-calendar-timegrid-allday-cells">
              {days.map((date) => (
                <AllDayCell
                  canReschedule={canReschedule}
                  date={date}
                  key={date}
                  label={dayFormatter.format(toNoonUtc(date))}
                  onDayClick={onDayClick}
                  onDrop={onDayShiftDrop}
                />
              ))}
            </div>
            <div
              aria-hidden={onEventClick || canReschedule ? undefined : true}
              className="lt-calendar-timegrid-allday-chips"
            >
              {allDayChips.map((chip) => (
                <AllDayChip
                  canReschedule={canReschedule}
                  chip={chip}
                  gridStart={gridStart}
                  isRescheduling={isRescheduling(chip.id)}
                  key={`${chip.id}-${chip.start}`}
                  locale={locale}
                  onDragStateChange={setDragging}
                  onEventClick={onEventClick}
                  onReschedule={submitAndRefocus}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lt-calendar-timegrid-scroll" ref={scrollRef}>
          <div className="lt-calendar-timegrid-row">
            <div aria-hidden="true" className="lt-calendar-timegrid-gutter">
              {hourLabels.map((label, hour) =>
                hour > 0 ? (
                  <span
                    className="lt-calendar-timegrid-hour-label text-[0.65rem] text-lt-muted-fg"
                    key={label}
                    style={{ top: `${(hour / 24) * 100}%` }}
                  >
                    {label}
                  </span>
                ) : null,
              )}
            </div>
            {days.map((date) => (
              <DayColumn
                canReschedule={canReschedule}
                date={date}
                eventList={eventList}
                isRescheduling={isRescheduling}
                key={date}
                locale={locale}
                nowMinutes={date === today ? nowMinutes : null}
                onDayClick={onDayClick}
                onEventClick={onEventClick}
                onDragStateChange={setDragging}
                onMoveDrop={onMoveDrop}
                onReschedule={submitAndRefocus}
                onResizeDrop={onResizeDrop}
                onResizeReschedule={submitResize}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AllDayCell({
  canReschedule,
  date,
  label,
  onDayClick,
  onDrop,
}: {
  canReschedule: boolean;
  date: string;
  label: string;
  onDayClick: ((date: string) => void) | null;
  onDrop: (data: Record<string | symbol, unknown>, date: string) => void;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    const element = cellRef.current;

    if (!element || !canReschedule) {
      return;
    }

    return dropTargetForElements({
      canDrop: ({ source }) => source.data.type === DAY_DRAG_TYPE,
      element,
      onDragEnter: () => setDropActive(true),
      onDragLeave: () => setDropActive(false),
      onDrop: ({ source }) => {
        setDropActive(false);
        onDrop(source.data, date);
      },
    });
  }, [canReschedule, date, onDrop]);

  return (
    <div
      aria-label={label}
      className={cn(
        "lt-calendar-timegrid-allday-cell border-l border-lt-border",
        onDayClick && "cursor-pointer",
        dropActive && "bg-lt-primary/10",
      )}
      data-test={`calendar-allday-${date}`}
      onClick={onDayClick ? () => onDayClick(date) : undefined}
      ref={cellRef}
    />
  );
}

function chipContent(event: CalendarEventData, locale: string) {
  return (
    <>
      {!event.allDay ? (
        <span className="shrink-0 font-medium tabular-nums">
          {formatWallTime(event.start, locale)}
        </span>
      ) : null}
      <span className="truncate">{event.label}</span>
    </>
  );
}

function eventLabel(event: CalendarEventData, t: Translate, reschedulable: boolean): string {
  if (reschedulable) {
    return t(
      "calendar.event-chip-label-reschedulable",
      "{{label}}, {{start}} to {{end}}. Use Control Shift and arrow keys to reschedule.",
      { end: event.end, label: event.label, start: event.start },
    );
  }

  return t("calendar.event-chip-label", "{{label}}, {{start}} to {{end}}", {
    end: event.end,
    label: event.label,
    start: event.start,
  });
}

function AllDayChip({
  canReschedule,
  chip,
  gridStart,
  isRescheduling,
  locale,
  onDragStateChange,
  onEventClick,
  onReschedule,
  t,
}: {
  canReschedule: boolean;
  chip: MonthChip;
  gridStart: string;
  isRescheduling: boolean;
  locale: string;
  onDragStateChange: (dragging: boolean) => void;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onReschedule: (request: CalendarRescheduleRequest) => void;
  t: Translate;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { event, span, start } = chip;

  useEffect(() => {
    const element = buttonRef.current;

    if (!element || !canReschedule) {
      return;
    }

    const [dayStart, dayEnd] = eventDaySpan(event);
    const durationDays = daysBetween(dayStart, dayEnd);
    const hiddenStartDays = daysBetween(dayStart, addDays(gridStart, start));

    return draggable({
      canDrag: () => !isRescheduling,
      element,
      getInitialData: ({ element: source, input }) => {
        const rect = source.getBoundingClientRect();
        const dayWidth = rect.width / span;

        return {
          grabOffsetDays: Math.max(
            0,
            Math.min(
              durationDays - 1,
              hiddenStartDays + Math.floor((input.clientX - rect.left) / dayWidth),
            ),
          ),
          id: event.id,
          type: DAY_DRAG_TYPE,
        };
      },
      onDragStart: () => {
        onDragStateChange(true);
        announce(
          t("calendar.dragging-day", "Moving {{label}}. Drop on a day.", { label: event.label }),
        );
      },
      onDrop: () => onDragStateChange(false),
    });
  }, [canReschedule, event, gridStart, isRescheduling, onDragStateChange, span, start, t]);

  function onKeyDown(keyboardEvent: KeyboardEvent<HTMLButtonElement>): void {
    if (!canReschedule || isRescheduling || !keyboardEvent.ctrlKey || !keyboardEvent.shiftKey) {
      return;
    }

    const deltaDays =
      keyboardEvent.key === "ArrowLeft" ? -1 : keyboardEvent.key === "ArrowRight" ? 1 : 0;

    if (deltaDays === 0) {
      return;
    }

    keyboardEvent.preventDefault();
    onReschedule({
      id: event.id,
      resourceId: event.resourceId,
      ...shiftEventDays(event, deltaDays),
    });
  }

  const tone = toneProps(coerceColor(event.color) ?? namedColor("primary"));
  const className = cn(
    "lt-calendar-chip mx-1 my-0.5 flex items-center gap-1 overflow-hidden px-1.5 text-left text-xs",
    tone.className,
    chip.continuesBefore ? "rounded-l-none" : "rounded-l-lt-xs",
    chip.continuesAfter ? "rounded-r-none" : "rounded-r-lt-xs",
    (onEventClick || canReschedule) &&
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lt-primary",
    onEventClick && "cursor-pointer",
    canReschedule && !onEventClick && "cursor-grab",
  );
  const style = {
    gridColumn: `${chip.start + 1} / span ${chip.span}`,
    gridRow: chip.lane + 1,
    ...tone.style,
  };

  if (!onEventClick && !canReschedule) {
    return (
      <div
        className={className}
        data-end={event.end}
        data-start={event.start}
        data-test={`calendar-event-${chip.id}`}
        style={style}
      >
        {chipContent(event, locale)}
      </div>
    );
  }

  return (
    <button
      aria-disabled={isRescheduling || undefined}
      aria-keyshortcuts={
        canReschedule ? "Control+Shift+ArrowLeft Control+Shift+ArrowRight" : undefined
      }
      aria-label={eventLabel(event, t, canReschedule)}
      className={className}
      data-end={event.end}
      data-start={event.start}
      data-test={`calendar-event-${chip.id}`}
      onClick={onEventClick ? () => onEventClick(event) : undefined}
      onKeyDown={onKeyDown}
      ref={buttonRef}
      style={style}
      title={event.label}
      type="button"
    >
      {chipContent(event, locale)}
    </button>
  );
}

type DropPreview = { startMin: number; durationMin: number };

function DayColumn({
  canReschedule,
  date,
  eventList,
  isRescheduling,
  locale,
  nowMinutes,
  onDayClick,
  onDragStateChange,
  onEventClick,
  onMoveDrop,
  onReschedule,
  onResizeDrop,
  onResizeReschedule,
  t,
}: {
  canReschedule: boolean;
  date: string;
  eventList: CalendarEventData[];
  isRescheduling: (id: string) => boolean;
  locale: string;
  nowMinutes: number | null;
  onDayClick: ((date: string) => void) | null;
  onDragStateChange: (dragging: boolean) => void;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onMoveDrop: (data: Record<string | symbol, unknown>, date: string, startMin: number) => void;
  onReschedule: (request: CalendarRescheduleRequest) => void;
  onResizeDrop: (data: Record<string | symbol, unknown>, endMin: number) => void;
  onResizeReschedule: (request: CalendarRescheduleRequest) => void;
  t: Translate;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<DropPreview | null>(null);
  const segments = useMemo(
    () => layoutDayColumns(timedSegmentsOnDay(eventList, date)),
    [eventList, date],
  );

  const moveStartMin = useCallback(
    (data: Record<string | symbol, unknown>, clientY: number, column: Element): number => {
      const grabOffsetMin = typeof data.grabOffsetMin === "number" ? data.grabOffsetMin : 0;
      const durationMin = typeof data.durationMin === "number" ? data.durationMin : 0;

      return snapMinute(
        minuteFromPointer(clientY, column) - grabOffsetMin,
        Math.min(durationMin, MINUTES_PER_DAY),
      );
    },
    [],
  );

  useEffect(() => {
    const element = columnRef.current;

    if (!element || !canReschedule) {
      return;
    }

    return dropTargetForElements({
      canDrop: ({ source }) =>
        source.data.type === MOVE_DRAG_TYPE ||
        (source.data.type === RESIZE_DRAG_TYPE && source.data.date === date),
      element,
      onDrag: ({ location, source }) => {
        const clientY = location.current.input.clientY;

        if (source.data.type === MOVE_DRAG_TYPE) {
          const durationMin =
            typeof source.data.durationMin === "number" ? source.data.durationMin : 0;

          setPreview({ startMin: moveStartMin(source.data, clientY, element), durationMin });
        }
      },
      onDragLeave: () => setPreview(null),
      onDrop: ({ location, source }) => {
        setPreview(null);

        const clientY = location.current.input.clientY;

        if (source.data.type === RESIZE_DRAG_TYPE) {
          onResizeDrop(source.data, snapMinute(minuteFromPointer(clientY, element)));

          return;
        }

        onMoveDrop(source.data, date, moveStartMin(source.data, clientY, element));
      },
    });
  }, [canReschedule, date, moveStartMin, onMoveDrop, onResizeDrop]);

  return (
    <div
      className={cn(
        "lt-calendar-timegrid-col border-l border-lt-border",
        onDayClick && "cursor-pointer",
      )}
      data-test={`calendar-timegrid-col-${date}`}
      onClick={onDayClick ? () => onDayClick(date) : undefined}
      ref={columnRef}
    >
      {preview ? (
        <div
          aria-hidden="true"
          className="lt-calendar-timegrid-preview rounded-lt-xs border-2 border-dashed border-lt-primary"
          style={{
            top: `${(preview.startMin / MINUTES_PER_DAY) * 100}%`,
            height: `${(preview.durationMin / MINUTES_PER_DAY) * 100}%`,
          }}
        />
      ) : null}

      {nowMinutes !== null ? (
        <div
          aria-hidden="true"
          className="lt-calendar-timegrid-now"
          style={{ top: `${(nowMinutes / MINUTES_PER_DAY) * 100}%` }}
        />
      ) : null}

      {segments.map((segment) => (
        <TimedBlock
          canReschedule={canReschedule}
          date={date}
          isRescheduling={isRescheduling(segment.event.id)}
          key={segment.event.id}
          locale={locale}
          onDragStateChange={onDragStateChange}
          onEventClick={onEventClick}
          onReschedule={onReschedule}
          onResizeReschedule={onResizeReschedule}
          segment={segment}
          t={t}
        />
      ))}
    </div>
  );
}

function TimedBlock({
  canReschedule,
  date,
  isRescheduling,
  locale,
  onDragStateChange,
  onEventClick,
  onReschedule,
  onResizeReschedule,
  segment,
  t,
}: {
  canReschedule: boolean;
  date: string;
  isRescheduling: boolean;
  locale: string;
  onDragStateChange: (dragging: boolean) => void;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onReschedule: (request: CalendarRescheduleRequest) => void;
  onResizeReschedule: (request: CalendarRescheduleRequest) => void;
  segment: PositionedSegment;
  t: Translate;
}) {
  const blockRef = useRef<HTMLButtonElement>(null);
  const { event } = segment;
  const durationMin = segment.endMin - segment.startMin;

  useEffect(() => {
    const element = blockRef.current;

    if (!element || !canReschedule) {
      return;
    }

    return draggable({
      canDrag: () => !isRescheduling,
      element,
      getInitialData: ({ element: source, input }) => {
        const rect = source.getBoundingClientRect();
        const grabRatio = Math.max(0, Math.min(1, (input.clientY - rect.top) / rect.height));

        return {
          durationMin,
          grabOffsetMin: grabRatio * durationMin,
          id: event.id,
          type: MOVE_DRAG_TYPE,
        };
      },
      onDragStart: () => {
        onDragStateChange(true);
        announce(
          t("calendar.dragging-time", "Moving {{label}}. Drop on a time slot.", {
            label: event.label,
          }),
        );
      },
      onDrop: () => onDragStateChange(false),
    });
  }, [canReschedule, durationMin, event, isRescheduling, onDragStateChange, t]);

  function onKeyDown(keyboardEvent: KeyboardEvent<HTMLButtonElement>): void {
    if (!canReschedule || isRescheduling || !keyboardEvent.ctrlKey || !keyboardEvent.shiftKey) {
      return;
    }

    let request: CalendarRescheduleRequest;

    switch (keyboardEvent.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        const deltaDays = keyboardEvent.key === "ArrowLeft" ? -1 : 1;

        request = {
          id: event.id,
          resourceId: event.resourceId,
          ...shiftEventDays(event, deltaDays),
        };
        break;
      }
      case "ArrowUp":
      case "ArrowDown": {
        const deltaMin = keyboardEvent.key === "ArrowUp" ? -SNAP_MINUTES : SNAP_MINUTES;
        const startMin = segment.startMin + deltaMin;

        if (startMin < 0 || startMin + durationMin > MINUTES_PER_DAY) {
          return;
        }

        request = {
          id: event.id,
          resourceId: event.resourceId,
          start: addWallMinutes(event.start, deltaMin),
          end: addWallMinutes(event.end, deltaMin),
        };
        break;
      }
      default:
        return;
    }

    keyboardEvent.preventDefault();
    onReschedule(request);
  }

  const tone = toneProps(coerceColor(event.color) ?? namedColor("primary"));
  const positionStyle = {
    top: `${(segment.startMin / MINUTES_PER_DAY) * 100}%`,
    height: `${(durationMin / MINUTES_PER_DAY) * 100}%`,
    left: `${(segment.column / segment.columns) * 100}%`,
    width: `${(1 / segment.columns) * 100}%`,
  };
  const blockClassName = cn(
    "lt-calendar-chip flex h-full w-full flex-col items-start gap-0.5 overflow-hidden rounded-lt-xs px-1.5 py-1 text-left text-xs",
    tone.className,
    (onEventClick || canReschedule) &&
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lt-primary",
    onEventClick && "cursor-pointer",
    canReschedule && !onEventClick && "cursor-grab",
  );
  const blockContent = (
    <>
      <span className="font-medium tabular-nums">{formatWallTime(event.start, locale)}</span>
      <span className="truncate">{event.label}</span>
    </>
  );

  if (!onEventClick && !canReschedule) {
    return (
      <div className="lt-calendar-timegrid-block" style={positionStyle}>
        <div
          className={blockClassName}
          data-end={event.end}
          data-start={event.start}
          data-test={`calendar-event-${event.id}`}
          onClick={(clickEvent) => clickEvent.stopPropagation()}
          style={tone.style}
          title={event.label}
        >
          {blockContent}
        </div>
      </div>
    );
  }

  return (
    <div className="lt-calendar-timegrid-block" style={positionStyle}>
      <button
        aria-disabled={isRescheduling || undefined}
        aria-keyshortcuts={
          canReschedule
            ? "Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown"
            : undefined
        }
        aria-label={eventLabel(event, t, canReschedule)}
        className={blockClassName}
        data-end={event.end}
        data-start={event.start}
        data-test={`calendar-event-${event.id}`}
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onEventClick?.(event);
        }}
        onKeyDown={onKeyDown}
        ref={blockRef}
        style={tone.style}
        title={event.label}
        type="button"
      >
        {blockContent}
      </button>

      {canReschedule ? (
        <ResizeHandle
          date={date}
          event={event}
          isRescheduling={isRescheduling}
          onReschedule={onResizeReschedule}
          segment={segment}
          t={t}
        />
      ) : null}
    </div>
  );
}

function ResizeHandle({
  date,
  event,
  isRescheduling,
  onReschedule,
  segment,
  t,
}: {
  date: string;
  event: CalendarEventData;
  isRescheduling: boolean;
  onReschedule: (request: CalendarRescheduleRequest) => void;
  segment: PositionedSegment;
  t: Translate;
}) {
  const handleRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    const element = handleRef.current;

    if (!element) {
      return;
    }

    return draggable({
      canDrag: () => !isRescheduling,
      element,
      getInitialData: () => ({
        date,
        id: event.id,
        type: RESIZE_DRAG_TYPE,
      }),
      onDragStart: () => {
        setResizing(true);
        announce(t("calendar.resizing-end", "Resizing end of {{label}}.", { label: event.label }));
      },
      onDrop: () => setResizing(false),
    });
  }, [date, event, isRescheduling, t]);

  function onKeyDown(keyboardEvent: KeyboardEvent<HTMLDivElement>): void {
    if (isRescheduling) {
      return;
    }

    const delta =
      keyboardEvent.key === "ArrowUp"
        ? -SNAP_MINUTES
        : keyboardEvent.key === "ArrowDown"
          ? SNAP_MINUTES
          : 0;

    if (delta === 0) {
      return;
    }

    const endMin = segment.endMin + delta;

    if (endMin < segment.startMin + SNAP_MINUTES || endMin > MINUTES_PER_DAY) {
      return;
    }

    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    onReschedule({
      id: event.id,
      resourceId: event.resourceId,
      start: event.start,
      end: minuteToWallTime(date, endMin),
    });
  }

  return (
    <div
      aria-disabled={isRescheduling}
      aria-keyshortcuts="ArrowUp ArrowDown"
      aria-label={t("calendar.resize-end", "Resize end of {{label}}", { label: event.label })}
      aria-orientation="horizontal"
      aria-valuemax={MINUTES_PER_DAY}
      aria-valuemin={segment.startMin + SNAP_MINUTES}
      aria-valuenow={segment.endMin}
      aria-valuetext={event.end}
      className={cn(
        "lt-calendar-timegrid-resize cursor-ns-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lt-primary",
        resizing && "opacity-60",
      )}
      data-test={`calendar-resize-end-${event.id}`}
      onClick={(clickEvent) => clickEvent.stopPropagation()}
      onKeyDown={onKeyDown}
      ref={handleRef}
      role="separator"
      tabIndex={0}
    />
  );
}
