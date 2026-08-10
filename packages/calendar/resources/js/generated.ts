import type { Color } from "@lattice-php/core";

export type CalendarNodeType = "timeline";
export type ComponentPropsMap = {
  timeline: Timeline;
};
export type EntryData = {
  readonly color: Color | null;
  readonly end: string;
  readonly id: string;
  readonly label: string;
  readonly resourceId: string;
  readonly start: string;
};
export type NodeType = "timeline";
export type ResourceGroupData = {
  readonly key: string;
  readonly label: string;
  readonly resources: {
    id: string;
    label: string;
  }[];
};
export type Timeline = {
  days: number;
  endpoint: string | null;
  events: EntryData[];
  from: string;
  groups: ResourceGroupData[];
  ref: string | null;
};
