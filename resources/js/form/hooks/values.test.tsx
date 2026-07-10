import { act, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  FormValuesProvider,
  useFormValue,
  useFormValues,
  useFormValuesFor,
  useSetFormValue,
} from "./values";

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

  it("rerenders only the field whose selected value changed", () => {
    let firstRenders = 0;
    let secondRenders = 0;
    let formRenders = 0;
    let setValue: ReturnType<typeof useSetFormValue> = () => {};

    function FirstProbe() {
      firstRenders++;
      useFormValue("first");

      return null;
    }

    function SecondProbe() {
      secondRenders++;
      useFormValue("second");

      return null;
    }

    function FormProbe() {
      formRenders++;
      useFormValues();

      return null;
    }

    function SetterProbe() {
      setValue = useSetFormValue();

      return null;
    }

    render(
      <FormValuesProvider initial={{ first: "A", second: "B" }}>
        <FirstProbe />
        <SecondProbe />
        <FormProbe />
        <SetterProbe />
      </FormValuesProvider>,
    );

    expect(firstRenders).toBe(1);
    expect(secondRenders).toBe(1);
    expect(formRenders).toBe(1);

    act(() => setValue("first", "A2"));

    expect(firstRenders).toBe(2);
    expect(secondRenders).toBe(1);
    expect(formRenders).toBe(2);
  });

  it("keeps setter-only consumers stable when values change", () => {
    let setterRenders = 0;
    let setValue: ReturnType<typeof useSetFormValue> = () => {};

    function SetterProbe() {
      setterRenders++;
      setValue = useSetFormValue();

      return null;
    }

    render(
      <FormValuesProvider initial={{ name: "A" }}>
        <SetterProbe />
      </FormValuesProvider>,
    );

    expect(setterRenders).toBe(1);

    act(() => setValue("name", "B"));

    expect(setterRenders).toBe(1);
  });

  it("updates parent and child path subscribers without rerendering siblings", () => {
    let parentRenders = 0;
    let childRenders = 0;
    let siblingRenders = 0;
    let setValue: ReturnType<typeof useSetFormValue> = () => {};

    function ParentProbe() {
      parentRenders++;
      useFormValue("items");

      return null;
    }

    function ChildProbe() {
      childRenders++;
      useFormValue("items.0.name");

      return null;
    }

    function SiblingProbe() {
      siblingRenders++;
      useFormValue("items.1.name");

      return null;
    }

    function SetterProbe() {
      setValue = useSetFormValue();

      return null;
    }

    render(
      <FormValuesProvider initial={{ items: [{ name: "A" }, { name: "B" }] }}>
        <ParentProbe />
        <ChildProbe />
        <SiblingProbe />
        <SetterProbe />
      </FormValuesProvider>,
    );

    act(() => setValue("items.0.name", "A2"));

    expect(parentRenders).toBe(2);
    expect(childRenders).toBe(2);
    expect(siblingRenders).toBe(1);
  });

  it("uses a stable fallback store outside a provider", () => {
    const snapshots: Record<string, unknown>[] = [];

    function Probe({ tick }: { tick: number }) {
      snapshots.push(useFormValuesFor(["field"]));

      return <span>{tick}</span>;
    }

    const { rerender } = render(<Probe tick={1} />);

    rerender(<Probe tick={2} />);

    expect(snapshots).toHaveLength(2);
    expect(snapshots[1]).toBe(snapshots[0]);
  });

  it("returns selected values keyed by the caller's original path", () => {
    let selected: Record<string, unknown> = {};

    function Probe() {
      selected = useFormValuesFor([".address..city"]);

      return null;
    }

    render(
      <FormValuesProvider initial={{ address: { city: "Berlin" } }}>
        <Probe />
      </FormValuesProvider>,
    );

    expect(selected).toEqual({ ".address..city": "Berlin" });
  });
});
