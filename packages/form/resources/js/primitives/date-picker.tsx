import { lazy, Suspense } from "react";
import type { DatePickerFieldProps } from "./date-picker-view";

const DatePickerField = lazy(async () => {
  const { DatePickerField } = await import("./date-picker-view");

  return { default: DatePickerField };
});

export function DatePicker(props: DatePickerFieldProps) {
  return (
    <Suspense fallback={null}>
      <DatePickerField {...props} />
    </Suspense>
  );
}
