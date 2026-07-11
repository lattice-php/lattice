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
  withRowId,
  type RepeaterRow,
} from "@lattice-php/lattice/form/components/fields/repeater-rows";
import { RowKeyInputs } from "@lattice-php/lattice/form/components/fields/row-key-inputs";
import {
  rowTemplatesOf,
  type RowTemplate,
} from "@lattice-php/lattice/form/components/fields/row-templates";
import { useRowCollection } from "@lattice-php/lattice/form/components/fields/use-row-collection";
import { BlockCanvas } from "./canvas";
import { BlockInspector } from "./inspector";
import { moveBlock } from "./move-block";
import {
  appendBlockAt,
  blockAt,
  duplicateBlockAt,
  removeBlockAt,
  shiftBlockAt,
  slotAllowedTypes,
  updateBlockAt,
  walkBlocks,
  type BlockPath,
} from "./tree";
import { useBlockPreview, type BlockSource, type RenderedBlock } from "./use-block-preview";

function rowAttributes(row: RepeaterRow): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([key]) => key !== ROW_ID_KEY));
}

function rowSlots(row: RepeaterRow): Record<string, RepeaterRow[]> {
  return (row.slots ?? {}) as Record<string, RepeaterRow[]>;
}

export const BlockEditorComponent: RendererComponent<"field.block-editor"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const templates = rowTemplatesOf(node) ?? [];
  const rendered = (node as unknown as { rendered?: RenderedBlock[] }).rendered ?? [];

  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { path, rows, append } = useRowCollection(name, props.defaultItems ?? 0);
  const setValue = useSetFormValue();
  const { t } = useT("lattice");

  const seeds = useMemo(() => {
    const wire: Record<string, Node[]> = {};
    const sources: Record<string, BlockSource> = {};
    const walk = (seedRows: RepeaterRow[], seedRendered: RenderedBlock[]): void => {
      seedRows.forEach((row, i) => {
        const rowId = String(row[ROW_ID_KEY]);
        wire[rowId] = seedRendered[i]?.wire ?? [];
        sources[rowId] = { type: String(row.type ?? ""), attributes: rowAttributes(row) };

        for (const [slot, children] of Object.entries(rowSlots(row))) {
          if (Array.isArray(children)) {
            walk(children, seedRendered[i]?.slots?.[slot] ?? []);
          }
        }
      });
    };
    walk(rows, rendered);

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
    icon: template.icon,
    description: template.description,
  }));
  const atMax = props.maxItems != null && rows.length >= props.maxItems;

  const entries = walkBlocks(rows);
  const selectedRow =
    entries.find(({ row }) => String(row[ROW_ID_KEY]) === selectedId)?.row ?? null;

  const asRows = (prev: unknown): RepeaterRow[] =>
    Array.isArray(prev) ? (prev as RepeaterRow[]) : [];

  const onMoveBlock = (from: BlockPath, to: BlockPath): void => {
    setValue(path, (prev: unknown) => {
      const current = asRows(prev);
      const moved = blockAt(current, from);
      const allowed = slotAllowedTypes(templates, current, to);

      if (moved && allowed && !allowed.includes(String(moved.type))) {
        return current;
      }

      return moveBlock(current, from, to);
    });
  };

  const onFieldAt = (blockPath: BlockPath, field: string, value: unknown): void => {
    setValue(path, (prev: unknown) => updateBlockAt(asRows(prev), blockPath, field, value));
  };

  const onRemove = (blockPath: BlockPath): void => {
    setValue(path, (prev: unknown) => removeBlockAt(asRows(prev), blockPath));
  };

  const onDuplicate = (blockPath: BlockPath): void => {
    setValue(path, (prev: unknown) => duplicateBlockAt(asRows(prev), blockPath));
  };

  const onShift = (blockPath: BlockPath, delta: number): void => {
    setValue(path, (prev: unknown) => shiftBlockAt(asRows(prev), blockPath, delta));
  };

  const addRow = (type: string): void => {
    const row = withRowId({ type });
    append(row);
    setSelectedId(String(row[ROW_ID_KEY]));
  };

  const onAppend = (parentPath: BlockPath, slot: string, type: string): void => {
    const row = withRowId({ type });
    setValue(path, (prev: unknown) => appendBlockAt(asRows(prev), parentPath, slot, row));
    setSelectedId(String(row[ROW_ID_KEY]));
  };

  /** The store path of the list containing the block at the given path. */
  const listBaseFor = (blockPath: BlockPath): string => {
    let current = path;

    for (let i = 0; i < blockPath.length - 1; i++) {
      const step = blockPath[i];
      current = appendPath(current, step.index, "slots", String(step.slot));
    }

    return current;
  };

  // A block is flagged when one of its own keys errs; descendant errors flag the descendant.
  const errorIds = new Set(
    entries
      .filter(({ path: blockPath }) => {
        const prefix = appendPath(listBaseFor(blockPath), blockPath[blockPath.length - 1].index);

        return Object.entries(errors).some(
          ([key, message]) =>
            Boolean(message) &&
            key.startsWith(`${prefix}.`) &&
            !key.slice(prefix.length + 1).includes("."),
        );
      })
      .map(({ row }) => String(row[ROW_ID_KEY])),
  );

  const refreshRow = (row: RepeaterRow): void => {
    void refresh(String(row[ROW_ID_KEY]), String(row.type ?? ""), rowAttributes(row));
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

      {entries
        .filter((entry) => entry.path.length > 1)
        .flatMap(({ row, path: blockPath }) => {
          const rowBase = appendPath(listBaseFor(blockPath), blockPath[blockPath.length - 1].index);

          return [ROW_ID_KEY, "type"].map((key) => (
            <input
              key={appendPath(rowBase, key)}
              type="hidden"
              name={toHtmlName(appendPath(rowBase, key))}
              value={String(row[key] ?? "")}
            />
          ));
        })}

      <div className="grid grid-cols-[1fr_18rem] gap-4">
        <div className="flex flex-col gap-3">
          <BlockCanvas
            rows={rows}
            templates={templates}
            addLabel={props.addLabel ?? "Add"}
            wireFor={wireFor}
            onPreviewSeed={refreshRow}
            selectedId={selectedId}
            errorIds={errorIds}
            onSelect={setSelectedId}
            onMoveBlock={onMoveBlock}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
            onShift={onShift}
            onAppend={onAppend}
          />
          {!atMax && (
            <AddRowMenu addLabel={props.addLabel ?? "Add"} options={options} onSelect={addRow} />
          )}
        </div>

        <div data-test="block-editor-inspector">
          {entries.map(({ row, path: blockPath }) => {
            const rowId = String(row[ROW_ID_KEY]);
            const template = templateFor(row.type);

            return (
              <div key={rowId} className={rowId === selectedId ? undefined : "hidden"}>
                <BlockInspector
                  base={listBaseFor(blockPath)}
                  index={blockPath[blockPath.length - 1].index}
                  row={row}
                  template={template?.schema}
                  onField={(field, value) => onFieldAt(blockPath, field, value)}
                  onCommit={() => refreshRow(row)}
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
