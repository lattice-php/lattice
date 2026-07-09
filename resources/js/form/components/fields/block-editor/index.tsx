import { useMemo, useState } from "react";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "../../base/field";
import { appendPath, toHtmlName } from "../../form-path";
import { useSetFormValue } from "../../values";
import { BlockAddMenu, type BlockOption } from "../block-add-menu";
import { ROW_ID_KEY, type RepeaterRow } from "../repeater-rows";
import { useRowCollection } from "../use-row-collection";
import { BlockCanvas } from "./canvas";
import { hiddenInputsFor } from "./hidden-inputs";
import { BlockInspector } from "./inspector";
import { moveBlock, type BlockPath } from "./move-block";
import { useBlockPreview } from "./use-block-preview";

type BlockTemplate = { type: string; label: string; schema: Node[] };

export const BlockEditorComponent: RendererComponent<"field.block-editor"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const blocks = ((node as unknown as { blocks?: BlockTemplate[] }).blocks ??
    []) as BlockTemplate[];
  const rendered = ((node as unknown as { rendered?: Node[][] }).rendered ?? []) as Node[][];

  const { path, rows, onField, append } = useRowCollection(name, props.defaultItems ?? 0);
  const setValue = useSetFormValue();

  const initial = useMemo(() => {
    const map: Record<string, Node[]> = {};
    rows.forEach((row, i) => {
      map[String(row[ROW_ID_KEY])] = rendered[i] ?? [];
    });

    return map;
    // seed once from the server-rendered payload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { wireFor, refresh } = useBlockPreview({
    endpoint: props.endpoint ?? "",
    ref: props.ref ?? "",
    initial,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const templateFor = (type: unknown): BlockTemplate | undefined =>
    blocks.find((b) => b.type === type);
  const options: BlockOption[] = blocks.map((b) => ({ type: b.type, label: b.label }));

  const selectedRow = rows.find((row) => String(row[ROW_ID_KEY]) === selectedId) ?? null;

  const onMoveBlock = (from: BlockPath, to: BlockPath): void => {
    setValue(path, (prev: unknown) =>
      moveBlock(Array.isArray(prev) ? (prev as RepeaterRow[]) : [], from, to),
    );
  };

  return (
    <FormFieldFrame
      error={undefined}
      helperText={props.helperText ?? undefined}
      label={props.label ?? ""}
      name={path}
      required={false}
    >
      {rows.map((row, index) => (
        <input
          key={String(row[ROW_ID_KEY])}
          type="hidden"
          name={toHtmlName(appendPath(path, index, "type"))}
          value={String(row.type ?? "")}
        />
      ))}

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
          <BlockAddMenu
            addLabel={props.addLabel ?? "Add"}
            blocks={options}
            onSelect={(type) => append({ type })}
          />
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
                    refresh(
                      String(row[ROW_ID_KEY]),
                      String(row.type),
                      Object.fromEntries(Object.entries(row).filter(([k]) => k !== ROW_ID_KEY)),
                    )
                  }
                />
              </div>
            );
          })}
          {!selectedRow && <p className="text-sm text-lt-muted-fg">Select a block to edit it.</p>}
        </div>
      </div>
    </FormFieldFrame>
  );
};
