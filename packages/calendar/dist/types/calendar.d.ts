import { RendererComponent } from "@lattice-php/core";
import { CalendarWireProps } from "./types";
export type {
  CalendarEventData,
  CalendarRescheduleRequest,
  CalendarResourceData,
  CalendarView,
  CalendarWireProps,
  ResourceGroupData,
} from "./types";
declare module "@lattice-php/core" {
  interface ComponentProps {
    calendar: CalendarWireProps;
  }
}
declare const CalendarComponent: RendererComponent<"calendar">;
export default CalendarComponent;
