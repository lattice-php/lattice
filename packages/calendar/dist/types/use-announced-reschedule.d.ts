import { UseCalendarEventsReturn } from './calendar-state';
import { CalendarEventData, CalendarRescheduleRequest } from './types';
type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;
/**
 * Wraps the optimistic reschedule with the feedback both views share: a
 * screen-reader announcement on success and an announced danger toast on
 * rejection (the rollback itself happens in the event cache).
 */
export declare function useAnnouncedReschedule(events: Map<string, CalendarEventData>, reschedule: UseCalendarEventsReturn["reschedule"], t: Translate): {
    submitReschedule: (request: CalendarRescheduleRequest) => Promise<void>;
};
export {};
