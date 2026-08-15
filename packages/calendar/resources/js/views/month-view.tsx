import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
import {
  addDays,
  addMonths,
  formatWallTime,
  startOfMonthISO,
} from "@lattice-php/ui/format/temporal";
import { buildMonthGrid, capLanes, eventsOnDay, weekChips } from "../month-grid";
import type { MonthChip, MonthWeek } from "../month-grid";
import type { CalendarEventData } from "../types";

export const MAX_VISIBLE_LANES = 3;

type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;

export type MonthViewProps = {
  events: Map<string, CalendarEventData>;
  loading: boolean;
  locale: string;
  month: string;
  onDayClick: ((date: string) => void) | null;
  onEventClick: ((event: CalendarEventData) => void) | null;
  onNavigate: (month: string) => void;
  t: Translate;
  today: string;
};

function toNoonUtc(dateISO: string): Date {
  return new Date(`${dateISO}T12:00:00Z`);
}

export function MonthView({
  events,
  loading,
  locale,
  month,
  onDayClick,
  onEventClick,
  onNavigate,
  t,
  today,
}: MonthViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
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

  return (
    <div className="lt-calendar-month" ref={containerRef}>
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
        aria-busy={loading}
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
            dayFormatter={dayFormatter}
            eventList={eventList}
            first={weekIndex === 0}
            key={week.start}
            locale={locale}
            onCellKeyDown={onCellKeyDown}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
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
  dayFormatter,
  eventList,
  first,
  locale,
  onCellKeyDown,
  onDayClick,
  onEventClick,
  t,
  tabStopDate,
  week,
}: {
  dayFormatter: Intl.DateTimeFormat;
  eventList: CalendarEventData[];
  first: boolean;
  locale: string;
  onCellKeyDown: (keyboardEvent: KeyboardEvent<HTMLDivElement>, date: string) => void;
  onDayClick: ((date: string) => void) | null;
  onEventClick: ((event: CalendarEventData) => void) | null;
  t: Translate;
  tabStopDate: string;
  week: MonthWeek;
}) {
  const { chips } = weekChips(eventList, week.start);
  const { visible, hiddenByDay } = capLanes(chips, MAX_VISIBLE_LANES);

  return (
    <div className={cn("lt-calendar-week", !first && "border-t border-lt-border")} role="row">
      {week.days.map((day, dayIndex) => (
        <div
          aria-current={day.isToday ? "date" : undefined}
          aria-label={dayFormatter.format(toNoonUtc(day.date))}
          className={cn(
            "lt-calendar-day",
            dayIndex > 0 && "border-l border-lt-border",
            day.isWeekend && "bg-lt-muted/40",
            !day.inMonth && "text-lt-muted-fg",
            onDayClick && "cursor-pointer",
          )}
          data-date={day.date}
          data-test={`calendar-day-${day.date}`}
          key={day.date}
          onClick={onDayClick ? () => onDayClick(day.date) : undefined}
          onKeyDown={(keyboardEvent) => onCellKeyDown(keyboardEvent, day.date)}
          role="gridcell"
          tabIndex={day.date === tabStopDate ? 0 : -1}
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
        </div>
      ))}

      <div aria-hidden={onEventClick ? undefined : true} className="lt-calendar-chips">
        {visible.map((chip) => (
          <EventChip
            chip={chip}
            key={`${chip.id}-${chip.start}`}
            locale={locale}
            onEventClick={onEventClick}
            t={t}
          />
        ))}
      </div>
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

function chipLabel(event: CalendarEventData, t: Translate): string {
  return t("calendar.event-chip-label", "{{label}}, {{start}} to {{end}}", {
    end: event.end,
    label: event.label,
    start: event.start,
  });
}

function EventChip({
  chip,
  locale,
  onEventClick,
  t,
}: {
  chip: MonthChip;
  locale: string;
  onEventClick: ((event: CalendarEventData) => void) | null;
  t: Translate;
}) {
  const tone = toneProps(coerceColor(chip.event.color) ?? namedColor("primary"));
  const className = cn(
    "lt-calendar-chip mx-1 mb-0.5 flex items-center gap-1 overflow-hidden px-1.5 text-left text-xs",
    tone.className,
    chip.continuesBefore ? "rounded-l-none" : "rounded-l-lt-xs",
    chip.continuesAfter ? "rounded-r-none" : "rounded-r-lt-xs",
    onEventClick &&
      "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lt-primary",
  );
  const style = {
    gridColumn: `${chip.start + 1} / span ${chip.span}`,
    gridRow: chip.lane + 1,
    ...tone.style,
  };

  if (!onEventClick) {
    return (
      <div className={className} data-test={`calendar-event-${chip.id}`} style={style}>
        {chipContent(chip.event, locale)}
      </div>
    );
  }

  return (
    <button
      aria-label={chipLabel(chip.event, t)}
      className={className}
      data-test={`calendar-event-${chip.id}`}
      onClick={() => onEventClick(chip.event)}
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
