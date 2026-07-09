import type { ReactElement } from "react";
import { ROW_ID_KEY } from "../repeater-rows";

export function hiddenInputsFor(name: string, value: unknown): ReactElement[] {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => hiddenInputsFor(`${name}[${index}]`, item));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      key === ROW_ID_KEY ? [] : hiddenInputsFor(`${name}[${key}]`, child),
    );
  }

  return [<input key={name} type="hidden" name={name} value={String(value)} />];
}
