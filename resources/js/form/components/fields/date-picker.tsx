import { lazy, Suspense } from "react";
import type { DatePickerFieldProps } from "./date-picker-field";

const DatePickerField = lazy(async () => {
  const { DatePickerField } = await import("./date-picker-field");

  return { default: DatePickerField };
});

export function DatePicker(props: DatePickerFieldProps) {
  return (
    <Suspense fallback={null}>
      <DatePickerField {...props} />
    </Suspense>
  );
}
