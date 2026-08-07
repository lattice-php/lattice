import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { nodeIdentity } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
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
  TimelineResourceData,
  TimelineWireProps,
} from "./types";

export type {
  TimelineEventData,
  TimelineGroupData,
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
  const { eventsForResource, ensureRange, loading } = useTimelineEvents({
    endpoint: node.props.endpoint,
    componentRef: node.props.ref,
    initialEvents: node.props.events,
    initialFrom: node.props.from,
    days,
  });

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

      <div aria-busy={loading} className="lt-timeline-scroll rounded-lt-sm border border-lt-border">
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
              key={group.key}
              onToggle={() => toggleGroup(group.key)}
              t={t}
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
  collapsed,
  days,
  eventsForResource,
  from,
  group,
  onToggle,
  t,
}: {
  collapsed: boolean;
  days: number;
  eventsForResource: (resourceId: string) => TimelineEventData[];
  from: string;
  group: TimelineGroupData;
  onToggle: () => void;
  t: (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;
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
              days={days}
              eventsForResource={eventsForResource}
              from={from}
              key={resource.id}
              resource={resource}
            />
          ))
        : null}
    </>
  );
}

function TimelineResourceRow({
  days,
  eventsForResource,
  from,
  resource,
}: {
  days: number;
  eventsForResource: (resourceId: string) => TimelineEventData[];
  from: string;
  resource: TimelineResourceData;
}) {
  // ponytail: full render; row-windowing + bar culling when rows × events grows ~10x
  const { bars, laneCount } = barsForResource(resource.id, eventsForResource, from, days);
  const rowHeight = `calc(${Math.max(laneCount, 1)} * var(--lt-timeline-lane-height))`;

  return (
    <>
      <div
        className="lt-timeline-sticky-col flex items-center border-t border-lt-border px-2 text-sm text-lt-fg"
        style={{ height: rowHeight }}
      >
        {resource.label}
      </div>
      <div
        className="lt-timeline-resource-canvas border-t border-lt-border"
        style={{ height: rowHeight }}
      >
        <div className="lt-timeline-weekend-strip" aria-hidden="true" />
        {bars.map((bar) => {
          const tone = toneProps(coerceColor(bar.event.color) ?? namedColor("primary"));

          return (
            <div
              className={cn("lt-timeline-bar rounded-lt-xs px-1.5 py-1 text-xs", tone.className)}
              key={bar.id}
              style={{
                left: `calc(var(--lt-timeline-day-width) * ${bar.start})`,
                width: `calc(var(--lt-timeline-day-width) * ${bar.span})`,
                top: `calc(${bar.lane} * var(--lt-timeline-lane-height))`,
                height: "var(--lt-timeline-lane-height)",
                ...tone.style,
              }}
              title={bar.event.label}
            >
              {bar.event.label}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default TimelineComponent;
