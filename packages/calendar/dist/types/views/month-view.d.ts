import { UseCalendarEventsReturn } from "../calendar-state";
import { CalendarEventData } from "../types";
export declare const MAX_VISIBLE_LANES = 3;
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
export declare function MonthView({
  canReschedule,
  locale,
  month,
  onDayClick,
  onEventClick,
  onNavigate,
  state,
  t,
  today,
}: MonthViewProps): import("react").JSX.Element;

