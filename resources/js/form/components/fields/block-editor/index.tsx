import { useMemo, useState } from "react";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { FormFieldFrame } from "@lattice-php/lattice/form/components/base/field";
import { appendPath, toHtmlName } from "@lattice-php/lattice/form/lib/form-path";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";
import { useDependentField } from "@lattice-php/lattice/form/hooks/use-dependent-field";
import { useSetFormValue } from "@lattice-php/lattice/form/hooks/values";
import {
  AddRowMenu,
  type AddRowOption,
} from "@lattice-php/lattice/form/components/fields/add-row-menu";
import {
  ROW_ID_KEY,
  type RepeaterRow,
} from "@lattice-php/lattice/form/components/fields/repeater-rows";
import { RowKeyInputs } from "@lattice-php/lattice/form/components/fields/row-key-inputs";
import {
  rowTemplatesOf,
  type RowTemplate,
} from "@lattice-php/lattice/form/components/fields/row-templates";
import { useRowCollection } from "@lattice-php/lattice/form/components/fields/use-row-collection";
import { BlockCanvas } from "./canvas";
import { hiddenInputsFor } from "./hidden-inputs";
import { BlockInspector } from "./inspector";
import { moveBlock, type BlockPath } from "./move-block";
import { useBlockPreview, type BlockSource } from "./use-block-preview";

function rowAttributes(row: RepeaterRow): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([key]) => key !== ROW_ID_KEY));
}

export const BlockEditorComponent: RendererComponent<"field.block-editor"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const templates = rowTemplatesOf(node) ?? [];
  const rendered = ((node as unknown as { rendered?: Node[][] }).rendered ?? []) as Node[][];

  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { path, rows, onField, append } = useRowCollection(name, props.defaultItems ?? 0);
  const setValue = useSetFormValue();
  const { t } = useT("lattice");

  const seeds = useMemo(() => {
    const wire: Record<string, Node[]> = {};
    const sources: Record<string, BlockSource> = {};
    rows.forEach((row, i) => {
      const rowId = String(row[ROW_ID_KEY]);
      wire[rowId] = rendered[i] ?? [];
      sources[rowId] = { type: String(row.type ?? ""), attributes: rowAttributes(row) };
    });

    return { wire, sources };
    // seed once from the server-rendered payload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { wireFor, refresh } = useBlockPreview({
    endpoint: props.endpoint ?? "",
    ref: props.ref ?? "",
    initial: seeds.wire,
    renderedWith: seeds.sources,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (hidden) {
    return null;
  }

  const templateFor = (type: unknown): RowTemplate | undefined =>
    templates.find((template) => template.type === type);
  const options: AddRowOption[] = templates.map((template) => ({
    type: template.type,
    label: template.label,
  }));
  const atMax = props.maxItems != null && rows.length >= props.maxItems;

  const selectedRow = rows.find((row) => String(row[ROW_ID_KEY]) === selectedId) ?? null;

  const onMoveBlock = (from: BlockPath, to: BlockPath): void => {
    setValue(path, (prev: unknown) =>
      moveBlock(Array.isArray(prev) ? (prev as RepeaterRow[]) : [], from, to),
    );
  };

  return (
    <FormFieldFrame
      error={errors[path]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      name={path}
      required={required}
    >
      <RowKeyInputs path={path} rows={rows} rowKey={ROW_ID_KEY} />
      <RowKeyInputs path={path} rows={rows} rowKey="type" />

      {rows.flatMap((row, index) =>
        row.slots == null
          ? []
          : hiddenInputsFor(toHtmlName(appendPath(path, index, "slots")), row.slots),
      )}

      <div className="grid grid-cols-[1fr_18rem] gap-4">
        <div className="flex flex-col gap-3">
          <BlockCanvas
            rows={rows}
            wireFor={wireFor}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMoveBlock={onMoveBlock}
          />
          {!atMax && (
            <AddRowMenu
              addLabel={props.addLabel ?? "Add"}
              options={options}
              onSelect={(type) => append({ type })}
            />
          )}
        </div>

        <div data-test="block-editor-inspector">
          {rows.map((row, index) => {
            const isSelected = String(row[ROW_ID_KEY]) === selectedId;
            const template = templateFor(row.type);

            return (
              <div key={String(row[ROW_ID_KEY])} className={isSelected ? undefined : "hidden"}>
                <BlockInspector
                  base={path}
                  index={index}
                  row={row}
                  template={template?.schema}
                  onField={onField}
                  onCommit={() =>
                    refresh(String(row[ROW_ID_KEY]), String(row.type), rowAttributes(row))
                  }
                />
              </div>
            );
          })}
          {!selectedRow && (
            <p className="text-sm text-lt-muted-fg">
              {t("form.block-editor.select-block", "Select a block to edit it.")}
            </p>
          )}
        </div>
      </div>
    </FormFieldFrame>
  );
};
