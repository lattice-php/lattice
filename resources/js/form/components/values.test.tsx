import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { FormValuesProvider, useFormValue, useSetFormValue } from "./values";

function wrapper(initial: Record<string, unknown>) {
  return ({ children }: { children: ReactNode }) => (
    <FormValuesProvider initial={initial}>{children}</FormValuesProvider>
  );
}

describe("FormValues", () => {
  it("seeds from initial and updates on set", () => {
    const { result } = renderHook(
      () => ({ value: useFormValue("type"), setValue: useSetFormValue() }),
      { wrapper: wrapper({ type: "personal" }) },
    );

    expect(result.current.value).toBe("personal");

    act(() => result.current.setValue("type", "business"));

    expect(result.current.value).toBe("business");
  });
});
