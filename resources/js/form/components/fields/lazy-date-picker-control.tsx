import { lazy, Suspense } from "react";
import type { DatePickerControlProps } from "./date-picker-control";

const DatePickerControl = lazy(async () => {
  const { DatePickerControl } = await import("./date-picker-control");

  return { default: DatePickerControl };
});

export function LazyDatePickerControl(props: DatePickerControlProps) {
  return (
    <Suspense fallback={null}>
      <DatePickerControl {...props} />
    </Suspense>
  );
}
