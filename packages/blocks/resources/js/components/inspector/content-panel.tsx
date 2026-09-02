import { useCallback, useMemo } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { boundFields, unboundSchema } from "../../document/bindings";
import { updateData } from "../../document/store";
import type { BlockTypeData } from "../../types";
import { useEditor, useEditorState } from "../editor/editor-context";
import { FieldEmbed } from "./field-embed";

/** The block type's fields that are not edited inline, keyed to the rendered block's bindings. */
export function useUnboundSchema(id: string, type: BlockTypeData | null) {
  const rendered = useEditorState((state) => state.rendered[id]);

  return useMemo(() => {
    if (!type) {
      return [];
    }

    return rendered ? unboundSchema(type.schema, boundFields(rendered)) : type.schema;
  }, [rendered, type]);
}

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
  const schema = useUnboundSchema(id, type);
  const initial = useMemo(() => ({ ...type.defaults, ...data }), [data, type.defaults]);

  const onChange = useCallback(
    (field: string, value: unknown) => {
      store.setState((state) => updateData(state, id, field, value));
      requestRender(id);
    },
    [id, requestRender, store],
  );

  if (schema.length === 0) {
    return (
      <p className="px-3 py-3 text-sm text-lt-muted-fg">
        {t("blocks.editor.inspector.no-content-fields", "This block has no content fields.")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 px-3 py-3" data-test="blocks-content-panel">
      <FieldEmbed
        id={id}
        schema={schema}
        initial={initial}
        errors={blockErrors}
        onChange={onChange}
      />
    </div>
  );
}
