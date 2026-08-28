import { CalendarEventData, CalendarRescheduleRequest } from "./types";
export type UseCalendarEventsOptions = {
  endpoint: string | null;
  componentRef: string | null;
  initialEvents: CalendarEventData[];
  initialFrom: string;
  initialTo: string;
};
export type UseCalendarEventsReturn = {
  events: Map<string, CalendarEventData>;
  eventsForResource: (resourceId: string) => CalendarEventData[];
  ensureRange: (from: string, to: string) => void;
  isRescheduling: (id: string) => boolean;
  loading: boolean;
  reschedule: (request: CalendarRescheduleRequest) => Promise<{
    accepted: boolean;
    message: string | null;
  }>;
};
export declare function useCalendarEvents({
  endpoint,
  componentRef,
  initialEvents,
  initialFrom,
  initialTo,
}: UseCalendarEventsOptions): UseCalendarEventsReturn;
