import { useState } from "react";
import { apiFetch, nodeIdentity } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import type { Option } from "@lattice-php/core/types";
import { runAction } from "@lattice-php/action";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { currentTimezone, useT } from "@lattice-php/ui/i18n";
import {
  addDays,
  addMonths,
  startOfMonthISO,
  startOfWeekISO,
  todayISO,
} from "@lattice-php/ui/format/temporal";
import { useCalendarEvents } from "./calendar-state";
import { monthGridRange } from "./month-grid";
import { MonthView } from "./views/month-view";
import { TimeGridView } from "./views/time-grid-view";
import { TimelineView } from "./views/timeline-view";
import type {
  CalendarActionNode,
  CalendarEventData,
  CalendarView,
  CalendarWireProps,
} from "./types";

export type {
  CalendarEventData,
  CalendarRescheduleRequest,
  CalendarResourceData,
  CalendarView,
  CalendarWireProps,
  ResourceGroupData,
} from "./types";

declare module "@lattice-php/core" {
  interface ComponentProps {
    calendar: CalendarWireProps;
  }
}

/**
 * Mirrors the server's initial materialization window (`Calendar::window()`):
 * the month view padded ±7 days, the week view padded around the anchor
 * because the server does not know the locale's week start, the day view
 * covering the anchor date, and the timeline starting exactly at it. Seeding
 * the loaded ranges with the same union means the first navigation only
 * fetches genuinely uncovered days.
 */
function initialWindow(
  props: Pick<CalendarWireProps, "date" | "days" | "views">,
): [string, string] {
  const monthStart = startOfMonthISO(props.date);
  const ranges: [string, string][] = [];

  if (props.views.includes("month")) {
    ranges.push([addDays(monthStart, -7), addDays(addMonths(monthStart, 1), 7)]);
  }

  if (props.views.includes("week")) {
    ranges.push([addDays(props.date, -6), addDays(props.date, 7)]);
  }

  if (props.views.includes("day")) {
    ranges.push([props.date, addDays(props.date, 1)]);
  }

  if (props.views.includes("timeline")) {
    ranges.push([props.date, addDays(props.date, props.days)]);
  }

  if (ranges.length === 0) {
    return [props.date, addDays(props.date, props.days)];
  }

  let [from, to] = ranges[0];

  for (const [start, end] of ranges) {
    from = start < from ? start : from;
    to = end > to ? end : to;
  }

  return [from, to];
}

async function runComponentAction(
  action: CalendarActionNode,
  payload: Record<string, unknown>,
  dispatch: ReturnType<typeof useEffectDispatcher>,
): Promise<void> {
  const endpoint = action.props.endpoint;

  if (!endpoint) {
    return;
  }

  await runAction(
    () =>
      apiFetch(endpoint, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: action.props.method ?? "post",
        ref: action.props.ref ?? "",
        throwOnError: false,
      }),
    dispatch,
  );
}

const CalendarComponent: RendererComponent<"calendar"> = ({ node }) => {
  const identity = nodeIdentity(node);
  const { t, locale } = useT("calendar");
  const dispatch = useEffectDispatcher();
  const { date, dayAction, days, defaultView, eventAction, views } = node.props;
  const [activeView, setActiveView] = useState<CalendarView>(defaultView);
  const [month, setMonth] = useState(() => startOfMonthISO(date));
  const [timeGridFrom, setTimeGridFrom] = useState(date);
  const [timelineFrom, setTimelineFrom] = useState(date);
  const [today] = useState(() => todayISO(currentTimezone()));
  const [[initialFrom, initialTo]] = useState(() => initialWindow(node.props));
  const state = useCalendarEvents({
    endpoint: node.props.endpoint,
    componentRef: node.props.ref,
    initialEvents: node.props.events,
    initialFrom,
    initialTo,
  });

  function navigateMonth(nextMonth: string): void {
    setMonth(nextMonth);

    const [gridStart] = monthGridRange(addMonths(nextMonth, -1), locale);
    const [, gridEnd] = monthGridRange(addMonths(nextMonth, 1), locale);

    state.ensureRange(gridStart, gridEnd);
  }

  function navigateTimeline(nextFrom: string): void {
    setTimelineFrom(nextFrom);
    state.ensureRange(nextFrom, addDays(nextFrom, days));
  }

  function navigateTimeGrid(nextFrom: string, dayCount: number): void {
    setTimeGridFrom(nextFrom);

    const gridStart = dayCount === 1 ? nextFrom : startOfWeekISO(nextFrom, locale);

    state.ensureRange(addDays(gridStart, -dayCount), addDays(gridStart, dayCount * 2));
  }

  const onEventClick = eventAction
    ? (event: CalendarEventData) => {
        void runComponentAction(eventAction, { eventId: event.id, ...event.context }, dispatch);
      }
    : null;
  const onDayClick = dayAction
    ? (clickedDate: string) => {
        void runComponentAction(dayAction, { date: clickedDate }, dispatch);
      }
    : null;

  const canReschedule =
    node.props.endpoint !== null && node.props.ref !== null && node.props.reschedulable;

  const viewLabels: Record<CalendarView, string> = {
    month: t("calendar.view-month", "Month"),
    week: t("calendar.view-week", "Week"),
    day: t("calendar.view-day", "Day"),
    timeline: t("calendar.view-timeline", "Timeline"),
  };
  const viewOptions: Option[] = views.map((view) => ({
    data: null,
    value: view,
    label: viewLabels[view],
  }));

  return (
    <div className="lt-calendar" data-lattice-component={identity}>
      {views.length > 1 ? (
        <div className="mb-3">
          <SegmentedControl
            aria-label={t("calendar.view-switcher-label", "Calendar view")}
            name="calendar-view"
            onValueChange={(value) => setActiveView(value as CalendarView)}
            options={viewOptions}
            value={activeView}
          />
        </div>
      ) : null}

      {activeView === "month" ? (
        <MonthView
          canReschedule={canReschedule}
          locale={locale}
          month={month}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          onNavigate={navigateMonth}
          state={state}
          t={t}
          today={today}
        />
      ) : activeView === "week" || activeView === "day" ? (
        <TimeGridView
          canReschedule={canReschedule}
          dayCount={activeView === "week" ? 7 : 1}
          from={timeGridFrom}
          locale={locale}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          onNavigate={(nextFrom) => navigateTimeGrid(nextFrom, activeView === "week" ? 7 : 1)}
          state={state}
          t={t}
          today={today}
        />
      ) : (
        <TimelineView
          canReschedule={canReschedule}
          days={days}
          from={timelineFrom}
          groups={node.props.groups}
          locale={locale}
          onNavigate={navigateTimeline}
          state={state}
          t={t}
          today={today}
        />
      )}
    </div>
  );
};

export default CalendarComponent;
