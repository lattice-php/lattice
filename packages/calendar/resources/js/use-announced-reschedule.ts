import { useCallback } from "react";
import { announce } from "@lattice-php/lattice/dnd";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import type { UseCalendarEventsReturn } from "./calendar-state";
import type { CalendarEventData, CalendarRescheduleRequest } from "./types";

type Translate = (key: string, defaultValue?: string, options?: Record<string, unknown>) => string;

/**
 * Wraps the optimistic reschedule with the feedback both views share: a
 * screen-reader announcement on success and an announced danger toast on
 * rejection (the rollback itself happens in the event cache).
 */
export function useAnnouncedReschedule(
  events: Map<string, CalendarEventData>,
  reschedule: UseCalendarEventsReturn["reschedule"],
  t: Translate,
): { submitReschedule: (request: CalendarRescheduleRequest) => Promise<void> } {
  const dispatch = useEffectDispatcher();

  const submitReschedule = useCallback(
    async (request: CalendarRescheduleRequest): Promise<void> => {
      const event = events.get(request.id);

      if (!event) {
        return;
      }

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
      dispatch([{ type: "toast", props: { message, variant: "danger" } }]);
      announce(message);
    },
    [dispatch, events, reschedule, t],
  );

  return { submitReschedule };
}
