import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { FormValuesProvider, useFormValue, useFormValues, useSetFormValue } from "./values";

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

  it("reads and writes nested dot paths", () => {
    const { result } = renderHook(
      () => ({
        value: useFormValue("items.0.children.0.name"),
        values: useFormValues(),
        setValue: useSetFormValue(),
      }),
      { wrapper: wrapper({ items: [{ children: [{ name: "A" }] }] }) },
    );

    expect(result.current.value).toBe("A");

    act(() => result.current.setValue("items.0.children.0.name", "B"));

    expect(result.current.value).toBe("B");
    expect(result.current.values).toEqual({ items: [{ children: [{ name: "B" }] }] });
  });
});
