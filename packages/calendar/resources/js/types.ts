export type TimelineResourceData = {
  id: string;
  label: string;
};

export type TimelineGroupData = {
  key: string;
  label: string;
  resources: TimelineResourceData[];
};

/**
 * `start` is inclusive, `end` is exclusive — matches the half-open interval
 * `date-axis.ts` and lane assignment expect, so a bar ending the same day
 * another starts on never overlaps it.
 */
export type TimelineEventData = {
  id: string;
  resourceId: string;
  start: string;
  end: string;
  label: string;
  color?: unknown;
};

export type TimelineRescheduleRequest = Pick<
  TimelineEventData,
  "id" | "resourceId" | "start" | "end"
>;

export type TimelineWireProps = {
  groups: TimelineGroupData[];
  events: TimelineEventData[];
  from: string;
  days: number;
  ref: string | null;
  endpoint: string | null;
};
