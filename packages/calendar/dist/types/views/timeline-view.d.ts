import { UseCalendarEventsReturn } from "../calendar-state";
import { ResourceGroupData } from "../types";
type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;
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
export declare function TimelineView({
  canReschedule,
  days,
  from,
  groups,
  locale,
  onNavigate,
  state,
  t,
  today,
}: TimelineViewProps): import("react").JSX.Element;

