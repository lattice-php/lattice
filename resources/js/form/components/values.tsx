import { createContext, useCallback, useContext, useMemo, useState } from "react";

type FormValuesContextValue = {
  values: Record<string, unknown>;
  setValue: (name: string, value: unknown) => void;
};

const FormValuesContext = createContext<FormValuesContextValue>({
  values: {},
  setValue: () => {},
});

export function FormValuesProvider({
  initial,
  children,
}: {
  initial: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((current) =>
      Object.is(current[name], value) ? current : { ...current, [name]: value },
    );
  }, []);

  const contextValue = useMemo(() => ({ values, setValue }), [values, setValue]);

  return <FormValuesContext.Provider value={contextValue}>{children}</FormValuesContext.Provider>;
}

export function useFormValues(): Record<string, unknown> {
  return useContext(FormValuesContext).values;
}

export function useFormValue(name: string): unknown {
  return useContext(FormValuesContext).values[name];
}

export function useSetFormValue(): (name: string, value: unknown) => void {
  return useContext(FormValuesContext).setValue;
}
