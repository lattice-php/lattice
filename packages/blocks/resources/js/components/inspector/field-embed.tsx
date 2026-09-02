import { useCallback, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Renderer } from "@lattice-php/core";
import type { Node } from "@lattice-php/core";
import {
  FieldCommitOverrideProvider,
  FormProvider,
  FormValuesProvider,
  getPath,
  PrefillProvider,
  ResolvedNodesProvider,
  setPath,
  useFormValues,
  useSetFormValue,
} from "@lattice-php/form/embed";

/**
 * Hosts real form fields outside a form: every write goes straight to the
 * block's data instead of a submit. The inspector's content tab and the
 * inline popovers share this stack.
 */
export function FieldEmbed({
  id,
  schema,
  initial,
  errors,
  onChange,
}: {
  id: string;
  schema: readonly Node[];
  initial: Record<string, unknown>;
  errors: Record<string, string[]> | undefined;
  onChange: (field: string, value: unknown) => void;
}) {
  const firstErrors = useMemo(() => {
    const first: Record<string, string | undefined> = {};

    for (const [field, messages] of Object.entries(errors ?? {})) {
      first[field] = messages[0];
    }

    return first;
  }, [errors]);

  const form = useMemo(
    () => ({
      action: "#",
      clearErrors: () => {},
      componentId: `blocks-fields-${id}`,
      componentRef: "",
      errors: firstErrors,
      fieldIdPrefix: `blocks-fields-${id}`,
      fieldLabels: {},
      precognitive: false,
      processing: false,
      touch: () => {},
      validate: () => {},
      validateFields: () => {},
      validating: false,
    }),
    [firstErrors, id],
  );

  return (
    <FormProvider value={form}>
      <PrefillProvider value={{ markUserEdit: () => {} }}>
        <ResolvedNodesProvider nodes={{}}>
          <FormValuesProvider initial={initial}>
            <CommitBridge onChange={onChange}>
              <Renderer nodes={schema as Node[]} />
            </CommitBridge>
          </FormValuesProvider>
        </ResolvedNodesProvider>
      </PrefillProvider>
    </FormProvider>
  );
}

function CommitBridge({
  children,
  onChange,
}: {
  children: ReactNode;
  onChange: (field: string, value: unknown) => void;
}) {
  const values = useFormValues();
  const setValue = useSetFormValue();
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const write = useCallback(
    (name: string, value: unknown) => {
      const nextValue =
        typeof value === "function"
          ? (value as (previous: unknown) => unknown)(getPath(valuesRef.current, name))
          : value;

      valuesRef.current = setPath(valuesRef.current, name, nextValue);
      setValue(name, nextValue);
      const field = name.split(".")[0] as string;
      onChange(field, getPath(valuesRef.current, field));
    },
    [onChange, setValue],
  );

  const commit = useMemo(() => ({ blur: () => {}, change: write, commit: write }), [write]);

  return <FieldCommitOverrideProvider value={commit}>{children}</FieldCommitOverrideProvider>;
}
