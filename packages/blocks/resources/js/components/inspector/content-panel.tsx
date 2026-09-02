import { useCallback, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Renderer } from "@lattice-php/core";
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
import { useT } from "@lattice-php/ui/i18n";
import { updateData } from "../../document/store";
import type { BlockTypeData } from "../../types";
import { useEditor, useEditorState } from "../editor/editor-context";

export function ContentPanel({
  id,
  type,
  data,
}: {
  id: string;
  type: BlockTypeData;
  data: Record<string, unknown>;
}) {
  const { t } = useT("blocks");
  const { store, requestRender } = useEditor();
  const blockErrors = useEditorState((state) => state.errors[id]);
  const initial = useMemo(() => ({ ...type.defaults, ...data }), [data, type.defaults]);
  const errors = useMemo(() => {
    const first: Record<string, string | undefined> = {};

    for (const [field, messages] of Object.entries(blockErrors ?? {})) {
      first[field] = messages[0];
    }

    return first;
  }, [blockErrors]);

  const form = useMemo(
    () => ({
      action: "#",
      clearErrors: () => {},
      componentId: `blocks-content-${id}`,
      componentRef: "",
      errors,
      fieldIdPrefix: `blocks-content-${id}`,
      fieldLabels: {},
      precognitive: false,
      processing: false,
      touch: () => {},
      validate: () => {},
      validateFields: () => {},
      validating: false,
    }),
    [errors, id],
  );

  const onChange = useCallback(
    (field: string, value: unknown) => {
      store.setState((state) => updateData(state, id, field, value));
      requestRender(id);
    },
    [id, requestRender, store],
  );

  if (type.schema.length === 0) {
    return (
      <p className="px-3 py-3 text-sm text-lt-muted-fg">
        {t("blocks.editor.inspector.no-content-fields", "This block has no content fields.")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 px-3 py-3" data-test="blocks-content-panel">
      <FormProvider value={form}>
        <PrefillProvider value={{ markUserEdit: () => {} }}>
          <ResolvedNodesProvider nodes={{}}>
            <FormValuesProvider initial={initial}>
              <CommitBridge onChange={onChange}>
                <Renderer nodes={type.schema} />
              </CommitBridge>
            </FormValuesProvider>
          </ResolvedNodesProvider>
        </PrefillProvider>
      </FormProvider>
    </div>
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
      onChange(
        name.split(".")[0] as string,
        getPath(valuesRef.current, name.split(".")[0] as string),
      );
    },
    [onChange, setValue],
  );

  const commit = useMemo(() => ({ blur: () => {}, change: write, commit: write }), [write]);

  return <FieldCommitOverrideProvider value={commit}>{children}</FieldCommitOverrideProvider>;
}
