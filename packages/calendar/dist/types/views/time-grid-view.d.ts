import { UseCalendarEventsReturn } from "../calendar-state";
import { CalendarEventData } from "../types";
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
export declare function TimeGridView({
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
}: TimeGridViewProps): import("react").JSX.Element;

