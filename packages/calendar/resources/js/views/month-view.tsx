import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { announce, draggable, dropTargetForElements } from "@lattice-php/lattice/dnd";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
import {
  addDays,
  addMonths,
  daysBetween,
  formatWallTime,
  startOfMonthISO,
} from "@lattice-php/ui/format/temporal";
import { buildMonthGrid, capLanes, eventsOnDay, weekChips } from "../month-grid";
import { eventDaySpan, shiftEventDays } from "../event-span";
import { useAnnouncedReschedule } from "../use-announced-reschedule";
import type { MonthChip, MonthDay, MonthWeek } from "../month-grid";
import type { UseCalendarEventsReturn } from "../calendar-state";
import type { CalendarEventData } from "../types";

export const MAX_VISIBLE_LANES = 3;

const MONTH_DRAG_TYPE = "lattice-calendar-month-event";

type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;

export type MonthViewProps = {
  canReschedule: boolean;
  locale: string;
  month: string;
  onDayClick: ((date: string) => void) | null;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onNavigate: (month: string) => void;
  state: UseCalendarEventsReturn;
  t: Translate;
  today: string;
};

function toNoonUtc(dateISO: string): Date {
  return new Date(`${dateISO}T12:00:00Z`);
}

export function MonthView({
  canReschedule,
  locale,
  month,
  onDayClick,
  onEventClick,
  onNavigate,
  state,
  t,
  today,
}: MonthViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const pendingChipFocusRef = useRef<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { events, isRescheduling, loading, reschedule } = state;
  const { submitReschedule } = useAnnouncedReschedule(events, reschedule, t);
  const grid = useMemo(() => buildMonthGrid(month, locale, today), [month, locale, today]);
  const eventList = useMemo(() => [...events.values()], [events]);
  const title = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
        toNoonUtc(grid.monthStart),
      ),
    [grid.monthStart, locale],
  );
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
    [locale],
  );

  const inGrid = (date: string): boolean => date >= grid.gridStart && date < grid.gridEnd;
  const tabStopDate =
    focusedDate && inGrid(focusedDate) ? focusedDate : inGrid(today) ? today : grid.monthStart;

  function moveFocus(date: string): void {
    pendingFocusRef.current = date;
    setFocusedDate(date);

    if (!inGrid(date)) {
      onNavigate(startOfMonthISO(date));
    }
  }

  useEffect(() => {
    const pending = pendingFocusRef.current;

    if (!pending) {
      return;
    }

    const cell = containerRef.current?.querySelector<HTMLElement>(`[data-date="${pending}"]`);

    if (cell) {
      pendingFocusRef.current = null;
      cell.focus();
    }
  });

  useEffect(() => {
    const pending = pendingChipFocusRef.current;

    if (!pending) {
      return;
    }

    const chip = containerRef.current?.querySelector<HTMLElement>(
      `[data-test="calendar-event-${pending}"]`,
    );

    if (chip) {
      pendingChipFocusRef.current = null;
      chip.focus();
    }
  });

  function onCellKeyDown(keyboardEvent: KeyboardEvent<HTMLDivElement>, date: string): void {
    let next: string;

    switch (keyboardEvent.key) {
      case "ArrowLeft":
        next = addDays(date, -1);
        break;
      case "ArrowRight":
        next = addDays(date, 1);
        break;
      case "ArrowUp":
        next = addDays(date, -7);
        break;
      case "ArrowDown":
        next = addDays(date, 7);
        break;
      case "PageUp":
        next = addMonths(date, -1);
        break;
      case "PageDown":
        next = addMonths(date, 1);
        break;
      case "Enter":
      case " ":
        if (onDayClick && keyboardEvent.target === keyboardEvent.currentTarget) {
          keyboardEvent.preventDefault();
          onDayClick(date);
        }

        return;
      default:
        return;
    }

    keyboardEvent.preventDefault();
    moveFocus(next);
  }

  function moveEventByDays(event: CalendarEventData, deltaDays: number): void {
    if (deltaDays === 0) {
      return;
    }

    void submitReschedule({
      id: event.id,
      resourceId: event.resourceId,
      ...shiftEventDays(event, deltaDays),
    });
  }

  function onChipKeyDown(
    keyboardEvent: KeyboardEvent<HTMLButtonElement>,
    event: CalendarEventData,
  ): void {
    if (
      !canReschedule ||
      isRescheduling(event.id) ||
      !keyboardEvent.ctrlKey ||
      !keyboardEvent.shiftKey
    ) {
      return;
    }

    let deltaDays: number;

    switch (keyboardEvent.key) {
      case "ArrowLeft":
        deltaDays = -1;
        break;
      case "ArrowRight":
        deltaDays = 1;
        break;
      case "ArrowUp":
        deltaDays = -7;
        break;
      case "ArrowDown":
        deltaDays = 7;
        break;
      default:
        return;
    }

    keyboardEvent.preventDefault();
    pendingChipFocusRef.current = event.id;
    moveEventByDays(event, deltaDays);
  }

  const onEventDrop = useCallback(
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

  return (
    <div
      className="lt-calendar-month"
      data-dragging={dragging ? "true" : undefined}
      ref={containerRef}
    >
      <div className="mb-2 flex items-center gap-1">
        <button
          aria-label={t("calendar.previous", "Previous")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => onNavigate(addMonths(grid.monthStart, -1))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-left" />
        </button>
        <button
          aria-label={t("calendar.next", "Next")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => onNavigate(addMonths(grid.monthStart, 1))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-right" />
        </button>
        <button
          className="rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted"
          onClick={() => onNavigate(startOfMonthISO(today))}
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
        role="grid"
      >
        <div className="lt-calendar-weekdays border-b border-lt-border" role="row">
          {grid.weeks[0].days.map((day) => (
            <div
              className="px-2 py-1.5 text-xs font-medium text-lt-muted-fg"
              key={day.date}
              role="columnheader"
            >
              {weekdayFormatter.format(toNoonUtc(day.date))}
            </div>
          ))}
        </div>

        {grid.weeks.map((week, weekIndex) => (
          <MonthWeekRow
            canReschedule={canReschedule}
            dayFormatter={dayFormatter}
            eventList={eventList}
            first={weekIndex === 0}
            isRescheduling={isRescheduling}
            key={week.start}
            locale={locale}
            onCellKeyDown={onCellKeyDown}
            onChipKeyDown={onChipKeyDown}
            onDayClick={onDayClick}
            onDragStateChange={setDragging}
            onEventClick={onEventClick}
            onEventDrop={onEventDrop}
            t={t}
            tabStopDate={tabStopDate}
            week={week}
          />
        ))}
      </div>
    </div>
  );
}

function MonthWeekRow({
  canReschedule,
  dayFormatter,
  eventList,
  first,
  isRescheduling,
  locale,
  onCellKeyDown,
  onChipKeyDown,
  onDayClick,
  onDragStateChange,
  onEventClick,
  onEventDrop,
  t,
  tabStopDate,
  week,
}: {
  canReschedule: boolean;
  dayFormatter: Intl.DateTimeFormat;
  eventList: CalendarEventData[];
  first: boolean;
  isRescheduling: (id: string) => boolean;
  locale: string;
  onCellKeyDown: (keyboardEvent: KeyboardEvent<HTMLDivElement>, date: string) => void;
  onChipKeyDown: (
    keyboardEvent: KeyboardEvent<HTMLButtonElement>,
    event: CalendarEventData,
  ) => void;
  onDayClick: ((date: string) => void) | null;
  onDragStateChange: (dragging: boolean) => void;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onEventDrop: (data: Record<string | symbol, unknown>, date: string) => void;
  t: Translate;
  tabStopDate: string;
  week: MonthWeek;
}) {
  const { chips } = weekChips(eventList, week.start);
  const { visible, hiddenByDay } = capLanes(chips, MAX_VISIBLE_LANES);

  return (
    <div className={cn("lt-calendar-week", !first && "border-t border-lt-border")} role="row">
      {week.days.map((day, dayIndex) => (
        <MonthDayCell
          ariaLabel={dayFormatter.format(toNoonUtc(day.date))}
          canReschedule={canReschedule}
          day={day}
          dayIndex={dayIndex}
          key={day.date}
          onDayClick={onDayClick}
          onEventDrop={onEventDrop}
          onKeyDown={onCellKeyDown}
          tabStop={day.date === tabStopDate}
        >
          {hiddenByDay[dayIndex] > 0 ? (
            <DayOverflow
              count={hiddenByDay[dayIndex]}
              date={day.date}
              eventList={eventList}
              label={dayFormatter.format(toNoonUtc(day.date))}
              locale={locale}
              onEventClick={onEventClick}
              t={t}
            />
          ) : null}
        </MonthDayCell>
      ))}

      <div
        aria-hidden={onEventClick || canReschedule ? undefined : true}
        className="lt-calendar-chips"
      >
        {visible.map((chip) => (
          <EventChip
            canReschedule={canReschedule}
            chip={chip}
            isRescheduling={isRescheduling(chip.id)}
            key={`${chip.id}-${chip.start}`}
            locale={locale}
            onDragStateChange={onDragStateChange}
            onEventClick={onEventClick}
            onMoveKeyDown={onChipKeyDown}
            t={t}
            weekStart={week.start}
          />
        ))}
      </div>
    </div>
  );
}

function MonthDayCell({
  ariaLabel,
  canReschedule,
  children,
  day,
  dayIndex,
  onDayClick,
  onEventDrop,
  onKeyDown,
  tabStop,
}: {
  ariaLabel: string;
  canReschedule: boolean;
  children: ReactNode;
  day: MonthDay;
  dayIndex: number;
  onDayClick: ((date: string) => void) | null;
  onEventDrop: (data: Record<string | symbol, unknown>, date: string) => void;
  onKeyDown: (keyboardEvent: KeyboardEvent<HTMLDivElement>, date: string) => void;
  tabStop: boolean;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    const element = cellRef.current;

    if (!element || !canReschedule) {
      return;
    }

    return dropTargetForElements({
      canDrop: ({ source }) => source.data.type === MONTH_DRAG_TYPE,
      element,
      onDragEnter: () => setDropActive(true),
      onDragLeave: () => setDropActive(false),
      onDrop: ({ source }) => {
        setDropActive(false);
        onEventDrop(source.data, day.date);
      },
    });
  }, [canReschedule, day.date, onEventDrop]);

  return (
    <div
      aria-current={day.isToday ? "date" : undefined}
      aria-label={ariaLabel}
      className={cn(
        "lt-calendar-day",
        dayIndex > 0 && "border-l border-lt-border",
        day.isWeekend && "bg-lt-muted/40",
        !day.inMonth && "text-lt-muted-fg",
        onDayClick && "cursor-pointer",
        dropActive && "bg-lt-primary/10",
      )}
      data-date={day.date}
      data-test={`calendar-day-${day.date}`}
      onClick={onDayClick ? () => onDayClick(day.date) : undefined}
      onKeyDown={(keyboardEvent) => onKeyDown(keyboardEvent, day.date)}
      ref={cellRef}
      role="gridcell"
      tabIndex={tabStop ? 0 : -1}
    >
      <div className="flex justify-end px-1.5 pt-1">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs",
            day.isToday && "bg-lt-primary font-semibold text-lt-primary-fg",
            !day.isToday && !day.inMonth && "text-lt-muted-fg",
          )}
        >
          {day.dayOfMonth}
        </span>
      </div>
      <div className="flex-1" />
      {children}
    </div>
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

function chipLabel(event: CalendarEventData, t: Translate, reschedulable = false): string {
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

function EventChip({
  canReschedule,
  chip,
  isRescheduling,
  locale,
  onDragStateChange,
  onEventClick,
  onMoveKeyDown,
  t,
  weekStart,
}: {
  canReschedule: boolean;
  chip: MonthChip;
  isRescheduling: boolean;
  locale: string;
  onDragStateChange: (dragging: boolean) => void;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onMoveKeyDown: (
    keyboardEvent: KeyboardEvent<HTMLButtonElement>,
    event: CalendarEventData,
  ) => void;
  t: Translate;
  weekStart: string;
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
    const hiddenStartDays = daysBetween(dayStart, addDays(weekStart, start));

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
          type: MONTH_DRAG_TYPE,
        };
      },
      onDragStart: () => {
        onDragStateChange(true);
        announce(
          t("calendar.dragging-day", "Moving {{label}}. Drop on a day.", {
            label: event.label,
          }),
        );
      },
      onDrop: () => onDragStateChange(false),
    });
  }, [canReschedule, event, isRescheduling, onDragStateChange, span, start, t, weekStart]);

  const tone = toneProps(coerceColor(chip.event.color) ?? namedColor("primary"));
  const className = cn(
    "lt-calendar-chip mx-1 mb-0.5 flex items-center gap-1 overflow-hidden px-1.5 text-left text-xs",
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
        data-end={chip.event.end}
        data-start={chip.event.start}
        data-test={`calendar-event-${chip.id}`}
        style={style}
      >
        {chipContent(chip.event, locale)}
      </div>
    );
  }

  return (
    <button
      aria-disabled={isRescheduling || undefined}
      aria-keyshortcuts={
        canReschedule
          ? "Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown"
          : undefined
      }
      aria-label={chipLabel(chip.event, t, canReschedule)}
      className={className}
      data-end={chip.event.end}
      data-start={chip.event.start}
      data-test={`calendar-event-${chip.id}`}
      onClick={onEventClick ? () => onEventClick(chip.event) : undefined}
      onKeyDown={(keyboardEvent) => onMoveKeyDown(keyboardEvent, chip.event)}
      ref={buttonRef}
      style={style}
      title={chip.event.label}
      type="button"
    >
      {chipContent(chip.event, locale)}
    </button>
  );
}

function DayOverflow({
  count,
  date,
  eventList,
  label,
  locale,
  onEventClick,
  t,
}: {
  count: number;
  date: string;
  eventList: CalendarEventData[];
  label: string;
  locale: string;
  onEventClick: ((event: CalendarEventData) => void) | null;
  t: Translate;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("calendar.show-events-for-day", "Show all events on {{date}}", {
          date: label,
        })}
        className="mx-1 mb-1 rounded-lt-xs px-1.5 py-0.5 text-left text-xs text-lt-muted-fg hover:bg-lt-muted"
        data-test={`calendar-more-${date}`}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
      >
        {t("calendar.more-events", "+{{count}} more", { count })}
      </PopoverTrigger>
      <PopoverContent
        className="flex w-64 flex-col gap-1 p-2"
        data-test={`calendar-more-list-${date}`}
      >
        <p className="px-1 text-xs font-medium text-lt-muted-fg">{label}</p>
        {eventsOnDay(eventList, date).map((event) => {
          const tone = toneProps(coerceColor(event.color) ?? namedColor("primary"));
          const className = cn(
            "lt-calendar-chip flex items-center gap-1 overflow-hidden rounded-lt-xs px-1.5 py-1 text-left text-xs",
            tone.className,
            onEventClick && "cursor-pointer",
          );

          if (!onEventClick) {
            return (
              <div className={className} key={event.id} style={tone.style}>
                {chipContent(event, locale)}
              </div>
            );
          }

          return (
            <button
              aria-label={chipLabel(event, t)}
              className={className}
              key={event.id}
              onClick={() => onEventClick(event)}
              style={tone.style}
              type="button"
            >
              {chipContent(event, locale)}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
