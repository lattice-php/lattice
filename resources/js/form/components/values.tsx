import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getPath, setPath } from "./form-path";

type FormValuesContextValue = {
  values: Record<string, unknown>;
  setValue: (name: string, value: unknown) => void;
};

const FormValuesContext = createContext<FormValuesContextValue>({
  values: {},
  setValue: () => {},
});

function valuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (!a || !b || typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, index) => valuesEqual(value, b[index]))
    );
  }

  const aEntries = Object.entries(a);
  const bObject = b as Record<string, unknown>;

  return (
    aEntries.length === Object.keys(bObject).length &&
    aEntries.every(([key, value]) => valuesEqual(value, bObject[key]))
  );
}

export function FormValuesProvider({
  initial,
  children,
}: {
  initial: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const initialRef = useRef(initial);

  useEffect(() => {
    if (valuesEqual(initialRef.current, initial)) {
      return;
    }

    initialRef.current = initial;
    setValues(initial);
  }, [initial]);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((current) => {
      const next =
        typeof value === "function"
          ? (value as (previous: unknown) => unknown)(getPath(current, name))
          : value;

      return Object.is(getPath(current, name), next) ? current : setPath(current, name, next);
    });
  }, []);

  const contextValue = useMemo(() => ({ values, setValue }), [values, setValue]);

  return <FormValuesContext.Provider value={contextValue}>{children}</FormValuesContext.Provider>;
}

export function useFormValues(): Record<string, unknown> {
  return useContext(FormValuesContext).values;
}

export function useFormValue(name: string): unknown {
  return getPath(useContext(FormValuesContext).values, name);
}

export function useSetFormValue(): (name: string, value: unknown) => void {
  return useContext(FormValuesContext).setValue;
}
