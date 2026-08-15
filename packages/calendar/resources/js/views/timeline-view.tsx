import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { announce, draggable, dropTargetForElements } from "@lattice-php/lattice/dnd";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { addDays, daysBetween } from "@lattice-php/ui/format/temporal";
import { assignLanes, buildAxis } from "../date-axis";
import { eventDaySpan } from "../event-span";
import { useAnnouncedReschedule } from "../use-announced-reschedule";
import type { UseCalendarEventsReturn } from "../calendar-state";
import type {
  CalendarEventData,
  CalendarRescheduleRequest,
  CalendarResourceData,
  ResourceGroupData,
} from "../types";

const MIN_DAY_WIDTH = 10;
const MAX_DAY_WIDTH = 64;
const DEFAULT_DAY_WIDTH = 24;
const ZOOM_FACTOR = 1.25;
const NAV_STEP_DAYS = 7;
const TIMELINE_DRAG_TYPE = "lattice-calendar-entry";
const TIMELINE_RESIZE_TYPE = "lattice-calendar-entry-resize";

type ResizeEdge = "start" | "end";

type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;

/** A resource-bound event, reduced to the day-granular span the timeline lays out. */
type TimelineEntry = Omit<CalendarEventData, "resourceId"> & {
  resourceId: string;
  dayStart: string;
  dayEnd: string;
};

type Bar = {
  id: string;
  start: number;
  span: number;
  event: TimelineEntry;
};

export type TimelineViewProps = {
  canReschedule: boolean;
  days: number;
  from: string;
  groups: ResourceGroupData[];
  locale: string;
  onNavigate: (from: string) => void;
  state: UseCalendarEventsReturn;
  t: Translate;
  today: string;
};

function isResizeEdge(value: unknown): value is ResizeEdge {
  return value === "start" || value === "end";
}

function toEntries(events: CalendarEventData[]): TimelineEntry[] {
  return events.flatMap((event) => {
    if (event.resourceId === null) {
      return [];
    }

    const [dayStart, dayEnd] = eventDaySpan(event);

    return [{ ...event, resourceId: event.resourceId, dayStart, dayEnd }];
  });
}

function resizeRequest(
  event: Pick<TimelineEntry, "id" | "resourceId" | "dayStart" | "dayEnd">,
  edge: ResizeEdge,
  boundary: string,
): CalendarRescheduleRequest {
  if (edge === "start") {
    return {
      id: event.id,
      resourceId: event.resourceId,
      start: boundary < event.dayEnd ? boundary : addDays(event.dayEnd, -1),
      end: event.dayEnd,
    };
  }

  return {
    id: event.id,
    resourceId: event.resourceId,
    start: event.dayStart,
    end: boundary > event.dayStart ? boundary : addDays(event.dayStart, 1),
  };
}

function barsForResource(
  entries: TimelineEntry[],
  from: string,
  days: number,
): { bars: (Bar & { lane: number })[]; laneCount: number } {
  const clipped: Bar[] = [];

  for (const event of entries) {
    const start = Math.max(0, daysBetween(from, event.dayStart));
    const end = Math.min(days, daysBetween(from, event.dayEnd));
    const span = end - start;

    if (span > 0) {
      clipped.push({ id: event.id, start, span, event });
    }
  }

  return assignLanes(clipped);
}

export function TimelineView({
  canReschedule,
  days,
  from,
  groups,
  locale,
  onNavigate,
  state,
  t,
  today,
}: TimelineViewProps) {
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { events, eventsForResource, isRescheduling, loading, reschedule } = state;
  const { submitReschedule } = useAnnouncedReschedule(events, reschedule, t);
  const resources = useMemo(() => groups.flatMap((group) => group.resources), [groups]);

  const entriesForResource = useCallback(
    (resourceId: string) => toEntries(eventsForResource(resourceId)),
    [eventsForResource],
  );

  const axis = useMemo(() => buildAxis(from, days, locale, today), [from, days, locale, today]);
  const weekendOffset = axis.days.length > 0 ? (axis.days[0].weekday + 6) % 7 : 0;
  const todayIndex = daysBetween(from, today);
  const showTodayMarker = todayIndex >= 0 && todayIndex < days;
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );

  function toggleGroup(key: string): void {
    setCollapsed((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  const rescheduleEntry = useCallback(
    async (request: CalendarRescheduleRequest): Promise<void> => {
      const event = events.get(request.id);

      if (!event) {
        return;
      }

      const [dayStart, dayEnd] = eventDaySpan(event);

      if (
        event.resourceId === request.resourceId &&
        dayStart === request.start &&
        dayEnd === request.end
      ) {
        return;
      }

      await submitReschedule(request);
    },
    [events, submitReschedule],
  );

  const rootStyle = {
    "--lt-timeline-day-width": `${dayWidth}px`,
    "--lt-timeline-canvas-w": `calc(var(--lt-timeline-day-width) * ${days})`,
    "--lt-timeline-weekend-offset": weekendOffset,
  } as CSSProperties;

  return (
    <div className="lt-timeline">
      <div className="mb-2 flex items-center gap-1">
        <button
          aria-label={t("calendar.previous", "Previous")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => onNavigate(addDays(from, -NAV_STEP_DAYS))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-left" />
        </button>
        <button
          aria-label={t("calendar.next", "Next")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => onNavigate(addDays(from, NAV_STEP_DAYS))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-right" />
        </button>
        <button
          className="rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted"
          onClick={() => onNavigate(addDays(today, -NAV_STEP_DAYS))}
          type="button"
        >
          {t("calendar.today", "Today")}
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            aria-label={t("calendar.zoom-out", "Zoom out")}
            className="rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40"
            disabled={dayWidth <= MIN_DAY_WIDTH}
            onClick={() => setDayWidth((current) => Math.max(MIN_DAY_WIDTH, current / ZOOM_FACTOR))}
            type="button"
          >
            <Icon className="size-lt-icon-sm" name="minus" />
          </button>
          <button
            aria-label={t("calendar.zoom-in", "Zoom in")}
            className="rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40"
            disabled={dayWidth >= MAX_DAY_WIDTH}
            onClick={() => setDayWidth((current) => Math.min(MAX_DAY_WIDTH, current * ZOOM_FACTOR))}
            type="button"
          >
            <Icon className="size-lt-icon-sm" name="plus" />
          </button>
        </div>
      </div>

      <div
        aria-busy={loading || [...events.keys()].some((id) => isRescheduling(id))}
        className="lt-timeline-scroll rounded-lt-sm border border-lt-border"
      >
        <div className="lt-timeline-grid" style={rootStyle}>
          <div
            className={cn(
              "lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-months lt-timeline-header-cell",
            )}
          />
          <div
            className={cn("lt-timeline-sticky-row lt-timeline-row-months lt-timeline-header-cell")}
          >
            {axis.months.map((segment) => (
              <div
                className="lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs font-medium text-lt-fg"
                key={`${segment.start}-${segment.label}`}
                style={{
                  left: `calc(var(--lt-timeline-day-width) * ${segment.start})`,
                  width: `calc(var(--lt-timeline-day-width) * ${segment.span})`,
                }}
              >
                {segment.label}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-weeks lt-timeline-header-cell",
            )}
          />
          <div
            className={cn("lt-timeline-sticky-row lt-timeline-row-weeks lt-timeline-header-cell")}
          >
            {axis.weeks.map((segment) => (
              <div
                className="lt-timeline-segment flex items-center border-l border-lt-border px-2 text-xs text-lt-muted-fg"
                key={`${segment.start}-${segment.label}`}
                style={{
                  left: `calc(var(--lt-timeline-day-width) * ${segment.start})`,
                  width: `calc(var(--lt-timeline-day-width) * ${segment.span})`,
                }}
              >
                {t("calendar.week", "CW")} {segment.label}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "lt-timeline-sticky-col lt-timeline-sticky-row lt-timeline-corner lt-timeline-row-days lt-timeline-header-cell",
            )}
          />
          <div
            className={cn("lt-timeline-sticky-row lt-timeline-row-days lt-timeline-header-cell")}
          >
            <div className="lt-timeline-days-row">
              {axis.days.map((day) => (
                <div
                  className={cn(
                    "lt-timeline-day flex flex-col items-center justify-center border-l border-lt-border text-xs",
                    day.isWeekend && "bg-lt-muted text-lt-muted-fg",
                    day.isToday && "font-semibold text-lt-primary",
                  )}
                  key={day.date}
                >
                  <span>{weekdayFormatter.format(new Date(`${day.date}T12:00:00Z`))}</span>
                  <span>{day.dayOfMonth}</span>
                </div>
              ))}
            </div>
          </div>

          {groups.map((group) => (
            <TimelineGroupRows
              collapsed={collapsed.has(group.key)}
              days={days}
              entriesForResource={entriesForResource}
              from={from}
              group={group}
              isRescheduling={isRescheduling}
              key={group.key}
              onReschedule={rescheduleEntry}
              onToggle={() => toggleGroup(group.key)}
              resources={resources}
              t={t}
              canReschedule={canReschedule}
              dayWidth={dayWidth}
            />
          ))}

          {showTodayMarker ? (
            <div
              aria-hidden="true"
              className="lt-timeline-today-marker"
              style={{
                left: `calc(var(--lt-timeline-label-w) + var(--lt-timeline-day-width) * ${todayIndex})`,
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TimelineGroupRows({
  canReschedule,
  collapsed,
  dayWidth,
  days,
  entriesForResource,
  from,
  group,
  isRescheduling,
  onReschedule,
  onToggle,
  resources,
  t,
}: {
  canReschedule: boolean;
  collapsed: boolean;
  dayWidth: number;
  days: number;
  entriesForResource: (resourceId: string) => TimelineEntry[];
  from: string;
  group: ResourceGroupData;
  isRescheduling: (id: string) => boolean;
  onReschedule: (request: CalendarRescheduleRequest) => Promise<void>;
  onToggle: () => void;
  resources: CalendarResourceData[];
  t: Translate;
}) {
  return (
    <>
      <div className="lt-timeline-sticky-col flex items-center gap-1.5 border-t border-lt-border bg-lt-muted px-2 py-1.5 text-sm font-medium">
        <button
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? t("calendar.expand-group", "Expand {{label}}", { label: group.label })
              : t("calendar.collapse-group", "Collapse {{label}}", { label: group.label })
          }
          onClick={onToggle}
          type="button"
        >
          <Icon
            className={cn(
              "size-lt-icon-sm shrink-0 transition-transform",
              !collapsed && "rotate-90",
            )}
            name="chevron-right"
          />
        </button>
        <span>{group.label}</span>
      </div>
      <div className="lt-timeline-group-header-canvas border-t border-lt-border bg-lt-muted" />

      {!collapsed
        ? group.resources.map((resource) => (
            <TimelineResourceRow
              canReschedule={canReschedule}
              dayWidth={dayWidth}
              days={days}
              entriesForResource={entriesForResource}
              from={from}
              isRescheduling={isRescheduling}
              key={resource.id}
              onReschedule={onReschedule}
              resource={resource}
              resources={resources}
              t={t}
            />
          ))
        : null}
    </>
  );
}

function TimelineResourceRow({
  canReschedule,
  dayWidth,
  days,
  entriesForResource,
  from,
  isRescheduling,
  onReschedule,
  resource,
  resources,
  t,
}: {
  canReschedule: boolean;
  dayWidth: number;
  days: number;
  entriesForResource: (resourceId: string) => TimelineEntry[];
  from: string;
  isRescheduling: (id: string) => boolean;
  onReschedule: (request: CalendarRescheduleRequest) => Promise<void>;
  resource: CalendarResourceData;
  resources: CalendarResourceData[];
  t: Translate;
}) {
  // ponytail: full render; row-windowing + bar culling when rows × events grows ~10x
  const { bars, laneCount } = barsForResource(entriesForResource(resource.id), from, days);
  const rowHeight = `calc(${Math.max(laneCount, 1)} * var(--lt-timeline-lane-height))`;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    const element = canvasRef.current;

    if (!element || !canReschedule) {
      return;
    }

    return dropTargetForElements({
      canDrop: ({ source }) =>
        source.data.type === TIMELINE_DRAG_TYPE ||
        (source.data.type === TIMELINE_RESIZE_TYPE && source.data.resourceId === resource.id),
      element,
      getData: ({ element: target, input, source }) => {
        if (source.data.type === TIMELINE_RESIZE_TYPE) {
          const grabOffsetPx =
            typeof source.data.grabOffsetPx === "number" ? source.data.grabOffsetPx : 0;
          const boundaryIndex = Math.round(
            (input.clientX - target.getBoundingClientRect().left - grabOffsetPx) / dayWidth,
          );

          return {
            boundary: addDays(from, boundaryIndex),
            type: TIMELINE_RESIZE_TYPE,
          };
        }

        const grabOffsetDays =
          typeof source.data.grabOffsetDays === "number" ? source.data.grabOffsetDays : 0;
        const targetIndex = Math.floor(
          (input.clientX - target.getBoundingClientRect().left) / dayWidth,
        );
        const startIndex = targetIndex - grabOffsetDays;

        return {
          resourceId: resource.id,
          start: addDays(from, startIndex),
          type: TIMELINE_DRAG_TYPE,
        };
      },
      onDragEnter: () => setDropActive(true),
      onDragLeave: () => setDropActive(false),
      onDrop: ({ self, source }) => {
        setDropActive(false);

        if (source.data.type === TIMELINE_RESIZE_TYPE) {
          const { edge, end, id, resourceId, start } = source.data;
          const boundary = self.data.boundary;

          if (
            !isResizeEdge(edge) ||
            typeof boundary !== "string" ||
            typeof end !== "string" ||
            typeof id !== "string" ||
            typeof resourceId !== "string" ||
            typeof start !== "string"
          ) {
            return;
          }

          void onReschedule(
            resizeRequest({ id, resourceId, dayStart: start, dayEnd: end }, edge, boundary),
          );

          return;
        }

        const id = source.data.id;
        const durationDays = source.data.durationDays;
        const resourceId = self.data.resourceId;
        const start = self.data.start;

        if (
          typeof id !== "string" ||
          typeof durationDays !== "number" ||
          typeof resourceId !== "string" ||
          typeof start !== "string"
        ) {
          return;
        }

        void onReschedule({ id, resourceId, start, end: addDays(start, durationDays) });
      },
    });
  }, [canReschedule, dayWidth, from, onReschedule, resource.id]);

  return (
    <>
      <div
        className="lt-timeline-sticky-col flex items-center border-t border-lt-border px-2 text-sm text-lt-fg"
        style={{ height: rowHeight }}
      >
        {resource.label}
      </div>
      <div
        className={cn(
          "lt-timeline-resource-canvas border-t border-lt-border",
          dropActive && "bg-lt-primary/10",
        )}
        data-test={`timeline-resource-${resource.id}`}
        ref={canvasRef}
        style={{ height: rowHeight }}
      >
        <div className="lt-timeline-weekend-strip" aria-hidden="true" />
        {bars.map((bar) => (
          <TimelineBar
            bar={bar}
            canReschedule={canReschedule}
            dayWidth={dayWidth}
            days={days}
            from={from}
            isRescheduling={isRescheduling(bar.id)}
            key={bar.id}
            onReschedule={onReschedule}
            resource={resource}
            resources={resources}
            t={t}
          />
        ))}
      </div>
    </>
  );
}

function TimelineBar({
  bar,
  canReschedule,
  dayWidth,
  days,
  from,
  isRescheduling,
  onReschedule,
  resource,
  resources,
  t,
}: {
  bar: Bar & { lane: number };
  canReschedule: boolean;
  dayWidth: number;
  days: number;
  from: string;
  isRescheduling: boolean;
  onReschedule: (request: CalendarRescheduleRequest) => Promise<void>;
  resource: CalendarResourceData;
  resources: CalendarResourceData[];
  t: Translate;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const moveHandleRef = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const durationDays = daysBetween(bar.event.dayStart, bar.event.dayEnd);
  const hiddenStartDays = Math.max(0, daysBetween(bar.event.dayStart, from));
  const until = addDays(from, days);
  const tone = toneProps(coerceColor(bar.event.color) ?? namedColor("primary"));

  useEffect(() => {
    const element = barRef.current;
    const dragHandle = moveHandleRef.current;

    if (!element || !dragHandle || !canReschedule) {
      return;
    }

    return draggable({
      canDrag: () => !isRescheduling,
      dragHandle,
      element,
      getInitialData: ({ element: source, input }) => ({
        durationDays,
        grabOffsetDays: Math.max(
          0,
          Math.min(
            durationDays - 1,
            hiddenStartDays +
              Math.floor((input.clientX - source.getBoundingClientRect().left) / dayWidth),
          ),
        ),
        id: bar.id,
        type: TIMELINE_DRAG_TYPE,
      }),
      onDragStart: () => {
        setDragging(true);
        announce(
          t("calendar.dragging", "Moving {{label}}. Drop on a resource row.", {
            label: bar.event.label,
          }),
        );
      },
      onDrop: () => setDragging(false),
    });
  }, [
    bar.event.label,
    bar.id,
    canReschedule,
    dayWidth,
    durationDays,
    hiddenStartDays,
    isRescheduling,
    t,
  ]);

  function onKeyDown(keyboardEvent: KeyboardEvent<HTMLButtonElement>): void {
    if (!canReschedule || isRescheduling || !keyboardEvent.ctrlKey || !keyboardEvent.shiftKey) {
      return;
    }

    let resourceId = bar.event.resourceId;
    let start = bar.event.dayStart;
    const resourceIndex = resources.findIndex((candidate) => candidate.id === resourceId);

    switch (keyboardEvent.key) {
      case "ArrowLeft":
        start = addDays(start, -1);
        break;
      case "ArrowRight":
        start = addDays(start, 1);
        break;
      case "ArrowUp":
        resourceId = resources[resourceIndex - 1]?.id ?? resourceId;
        break;
      case "ArrowDown":
        resourceId = resources[resourceIndex + 1]?.id ?? resourceId;
        break;
      default:
        return;
    }

    const end = addDays(start, durationDays);

    if (start < from || end > addDays(from, days)) {
      return;
    }

    keyboardEvent.preventDefault();
    void onReschedule({ id: bar.id, resourceId, start, end });
  }

  return (
    <div
      className={cn("lt-timeline-bar rounded-lt-xs", tone.className, dragging && "opacity-60")}
      ref={barRef}
      style={{
        left: `calc(var(--lt-timeline-day-width) * ${bar.start})`,
        width: `calc(var(--lt-timeline-day-width) * ${bar.span})`,
        top: `calc(${bar.lane} * var(--lt-timeline-lane-height))`,
        height: "var(--lt-timeline-lane-height)",
        ...tone.style,
      }}
    >
      <button
        aria-disabled={!canReschedule || isRescheduling}
        aria-keyshortcuts="Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown"
        aria-label={t(
          "calendar.entry-label",
          "{{label}}, {{resource}}, {{start}} to {{end}}. Use Control Shift and arrow keys to reschedule.",
          {
            end: bar.event.dayEnd,
            label: bar.event.label,
            resource: resource.label,
            start: bar.event.dayStart,
          },
        )}
        className={cn(
          "h-full w-full overflow-hidden rounded-lt-xs px-1.5 py-1 text-left text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary",
          canReschedule && "cursor-grab",
        )}
        data-end={bar.event.dayEnd}
        data-resource-id={bar.event.resourceId}
        data-start={bar.event.dayStart}
        data-test={`timeline-entry-${bar.id}`}
        onKeyDown={onKeyDown}
        ref={moveHandleRef}
        title={bar.event.label}
        type="button"
      >
        {bar.event.label}
      </button>

      {canReschedule && bar.event.dayStart >= from ? (
        <TimelineResizeHandle
          edge="start"
          event={bar.event}
          from={from}
          isRescheduling={isRescheduling}
          onReschedule={onReschedule}
          t={t}
          until={until}
        />
      ) : null}

      {canReschedule && bar.event.dayEnd <= until ? (
        <TimelineResizeHandle
          edge="end"
          event={bar.event}
          from={from}
          isRescheduling={isRescheduling}
          onReschedule={onReschedule}
          t={t}
          until={until}
        />
      ) : null}
    </div>
  );
}

function TimelineResizeHandle({
  edge,
  event,
  from,
  isRescheduling,
  onReschedule,
  t,
  until,
}: {
  edge: ResizeEdge;
  event: TimelineEntry;
  from: string;
  isRescheduling: boolean;
  onReschedule: (request: CalendarRescheduleRequest) => Promise<void>;
  t: Translate;
  until: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const value = edge === "start" ? event.dayStart : event.dayEnd;

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    return draggable({
      canDrag: () => !isRescheduling,
      element,
      getInitialData: ({ element: source, input }) => {
        const rect = source.getBoundingClientRect();

        return {
          edge,
          end: event.dayEnd,
          grabOffsetPx: input.clientX - (rect.left + rect.width / 2),
          id: event.id,
          resourceId: event.resourceId,
          start: event.dayStart,
          type: TIMELINE_RESIZE_TYPE,
        };
      },
      onDragStart: () => {
        setResizing(true);
        announce(
          t(
            edge === "start" ? "calendar.resizing-start" : "calendar.resizing-end",
            edge === "start" ? "Resizing start of {{label}}." : "Resizing end of {{label}}.",
            { label: event.label },
          ),
        );
      },
      onDrop: () => setResizing(false),
    });
  }, [edge, event, isRescheduling, t]);

  function onKeyDown(keyboardEvent: KeyboardEvent<HTMLDivElement>): void {
    if (isRescheduling) {
      return;
    }

    const delta =
      keyboardEvent.key === "ArrowLeft" ? -1 : keyboardEvent.key === "ArrowRight" ? 1 : 0;

    if (delta === 0) {
      return;
    }

    const boundary = addDays(value, delta);

    if ((edge === "start" && boundary < from) || (edge === "end" && boundary > until)) {
      return;
    }

    keyboardEvent.preventDefault();
    void onReschedule(resizeRequest(event, edge, boundary));
  }

  const currentIndex = daysBetween(from, value);
  const minimum = edge === "start" ? 0 : daysBetween(from, event.dayStart) + 1;
  const maximum = edge === "start" ? daysBetween(from, event.dayEnd) - 1 : daysBetween(from, until);

  return (
    <div
      aria-disabled={isRescheduling}
      aria-keyshortcuts="ArrowLeft ArrowRight"
      aria-label={t(
        edge === "start" ? "calendar.resize-start" : "calendar.resize-end",
        edge === "start" ? "Resize start of {{label}}" : "Resize end of {{label}}",
        { label: event.label },
      )}
      aria-orientation="vertical"
      aria-valuemax={maximum}
      aria-valuemin={minimum}
      aria-valuenow={currentIndex}
      aria-valuetext={value}
      className={cn(
        "absolute inset-y-0 z-[2] w-2 cursor-ew-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary after:absolute after:inset-y-1 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-current after:opacity-50",
        edge === "start" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        resizing && "opacity-60",
      )}
      data-test={`timeline-resize-${edge}-${event.id}`}
      onKeyDown={onKeyDown}
      ref={ref}
      role="separator"
      tabIndex={0}
    />
  );
}
