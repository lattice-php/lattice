import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { nodeIdentity } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import { announce, draggable, dropTargetForElements } from "@lattice-php/lattice/dnd";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { Icon } from "@lattice-php/ui/icons";
import { currentTimezone, useT } from "@lattice-php/ui/i18n";
import { addDays, daysBetween, todayISO } from "@lattice-php/ui/format/temporal";
import { assignLanes, buildAxis } from "./date-axis";
import { useTimelineEvents } from "./timeline-state";
import type {
  TimelineEventData,
  TimelineGroupData,
  TimelineRescheduleRequest,
  TimelineResourceData,
  TimelineWireProps,
} from "./types";

export type {
  TimelineEventData,
  TimelineGroupData,
  TimelineRescheduleRequest,
  TimelineResourceData,
  TimelineWireProps,
} from "./types";

declare module "@lattice-php/core" {
  interface ComponentProps {
    timeline: TimelineWireProps;
  }
}

const MIN_DAY_WIDTH = 10;
const MAX_DAY_WIDTH = 64;
const DEFAULT_DAY_WIDTH = 24;
const ZOOM_FACTOR = 1.25;
const NAV_STEP_DAYS = 7;
const TIMELINE_DRAG_TYPE = "lattice-calendar-entry";

type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;

type Bar = {
  id: string;
  start: number;
  span: number;
  event: TimelineEventData;
};

function barsForResource(
  resourceId: string,
  eventsForResource: (resourceId: string) => TimelineEventData[],
  from: string,
  days: number,
): { bars: (Bar & { lane: number })[]; laneCount: number } {
  const clipped: Bar[] = [];

  for (const event of eventsForResource(resourceId)) {
    const start = Math.max(0, daysBetween(from, event.start));
    const end = Math.min(days, daysBetween(from, event.end));
    const span = end - start;

    if (span > 0) {
      clipped.push({ id: event.id, start, span, event });
    }
  }

  return assignLanes(clipped);
}

const TimelineComponent: RendererComponent<"timeline"> = ({ node }) => {
  const identity = nodeIdentity(node);
  const { t, locale } = useT("calendar");
  const [from, setFrom] = useState(node.props.from);
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [today] = useState(() => todayISO(currentTimezone()));
  const { days } = node.props;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { events, eventsForResource, ensureRange, isRescheduling, loading, reschedule } =
    useTimelineEvents({
      endpoint: node.props.endpoint,
      componentRef: node.props.ref,
      initialEvents: node.props.events,
      initialFrom: node.props.from,
      days,
    });
  const resources = useMemo(
    () => node.props.groups.flatMap((group) => group.resources),
    [node.props.groups],
  );

  const axis = useMemo(() => buildAxis(from, days, locale, today), [from, days, locale, today]);
  const weekendOffset = axis.days.length > 0 ? (axis.days[0].weekday + 6) % 7 : 0;
  const todayIndex = daysBetween(from, today);
  const showTodayMarker = todayIndex >= 0 && todayIndex < days;
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );

  function navigate(nextFrom: string): void {
    setFrom(nextFrom);
    ensureRange(nextFrom, addDays(nextFrom, days));
  }

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
    async (request: TimelineRescheduleRequest): Promise<void> => {
      const event = events.get(request.id);

      if (!event) {
        return;
      }

      if (
        event.resourceId === request.resourceId &&
        event.start === request.start &&
        event.end === request.end
      ) {
        return;
      }

      setErrorMessage(null);
      const result = await reschedule(request);

      if (result.accepted) {
        announce(t("calendar.rescheduled", "Rescheduled {{label}}", { label: event.label }));
        return;
      }

      const message =
        result.message ??
        t("calendar.reschedule-failed", "Could not reschedule {{label}}", {
          label: event.label,
        });
      setErrorMessage(message);
      announce(message);
    },
    [events, reschedule, t],
  );

  const rootStyle = {
    "--lt-timeline-day-width": `${dayWidth}px`,
    "--lt-timeline-canvas-w": `calc(var(--lt-timeline-day-width) * ${days})`,
    "--lt-timeline-weekend-offset": weekendOffset,
  } as CSSProperties;

  return (
    <div className="lt-timeline" data-lattice-component={identity}>
      <div className="mb-2 flex items-center gap-1">
        <button
          aria-label={t("calendar.previous", "Previous")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => navigate(addDays(from, -NAV_STEP_DAYS))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-left" />
        </button>
        <button
          aria-label={t("calendar.next", "Next")}
          className="rounded-lt-sm p-1.5 hover:bg-lt-muted"
          onClick={() => navigate(addDays(from, NAV_STEP_DAYS))}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="chevron-right" />
        </button>
        <button
          className="rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted"
          onClick={() => navigate(addDays(today, -NAV_STEP_DAYS))}
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

      {errorMessage ? (
        <div className="mb-2 text-sm text-lt-danger" role="alert">
          {errorMessage}
        </div>
      ) : null}

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

          {node.props.groups.map((group) => (
            <TimelineGroupRows
              collapsed={collapsed.has(group.key)}
              days={days}
              eventsForResource={eventsForResource}
              from={from}
              group={group}
              isRescheduling={isRescheduling}
              key={group.key}
              onReschedule={rescheduleEntry}
              onToggle={() => toggleGroup(group.key)}
              resources={resources}
              t={t}
              canReschedule={node.props.endpoint !== null && node.props.ref !== null}
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
};

function TimelineGroupRows({
  canReschedule,
  collapsed,
  dayWidth,
  days,
  eventsForResource,
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
  eventsForResource: (resourceId: string) => TimelineEventData[];
  from: string;
  group: TimelineGroupData;
  isRescheduling: (id: string) => boolean;
  onReschedule: (request: TimelineRescheduleRequest) => Promise<void>;
  onToggle: () => void;
  resources: TimelineResourceData[];
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
              eventsForResource={eventsForResource}
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
  eventsForResource,
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
  eventsForResource: (resourceId: string) => TimelineEventData[];
  from: string;
  isRescheduling: (id: string) => boolean;
  onReschedule: (request: TimelineRescheduleRequest) => Promise<void>;
  resource: TimelineResourceData;
  resources: TimelineResourceData[];
  t: Translate;
}) {
  // ponytail: full render; row-windowing + bar culling when rows × events grows ~10x
  const { bars, laneCount } = barsForResource(resource.id, eventsForResource, from, days);
  const rowHeight = `calc(${Math.max(laneCount, 1)} * var(--lt-timeline-lane-height))`;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    const element = canvasRef.current;

    if (!element || !canReschedule) {
      return;
    }

    return dropTargetForElements({
      canDrop: ({ source }) => source.data.type === TIMELINE_DRAG_TYPE,
      element,
      getData: ({ element: target, input, source }) => {
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
  onReschedule: (request: TimelineRescheduleRequest) => Promise<void>;
  resource: TimelineResourceData;
  resources: TimelineResourceData[];
  t: Translate;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const durationDays = daysBetween(bar.event.start, bar.event.end);
  const hiddenStartDays = Math.max(0, daysBetween(bar.event.start, from));
  const tone = toneProps(coerceColor(bar.event.color) ?? namedColor("primary"));

  useEffect(() => {
    const element = ref.current;

    if (!element || !canReschedule) {
      return;
    }

    return draggable({
      canDrag: () => !isRescheduling,
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
    let start = bar.event.start;
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
    <button
      aria-disabled={!canReschedule || isRescheduling}
      aria-keyshortcuts="Control+Shift+ArrowLeft Control+Shift+ArrowRight Control+Shift+ArrowUp Control+Shift+ArrowDown"
      aria-label={t(
        "calendar.entry-label",
        "{{label}}, {{resource}}, {{start}} to {{end}}. Use Control Shift and arrow keys to reschedule.",
        {
          end: bar.event.end,
          label: bar.event.label,
          resource: resource.label,
          start: bar.event.start,
        },
      )}
      className={cn(
        "lt-timeline-bar cursor-grab rounded-lt-xs px-1.5 py-1 text-left text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary",
        tone.className,
        dragging && "opacity-60",
      )}
      data-resource-id={bar.event.resourceId}
      data-start={bar.event.start}
      data-test={`timeline-entry-${bar.id}`}
      onKeyDown={onKeyDown}
      ref={ref}
      style={{
        left: `calc(var(--lt-timeline-day-width) * ${bar.start})`,
        width: `calc(var(--lt-timeline-day-width) * ${bar.span})`,
        top: `calc(${bar.lane} * var(--lt-timeline-lane-height))`,
        height: "var(--lt-timeline-lane-height)",
        ...tone.style,
      }}
      title={bar.event.label}
      type="button"
    >
      {bar.event.label}
    </button>
  );
}

export default TimelineComponent;
