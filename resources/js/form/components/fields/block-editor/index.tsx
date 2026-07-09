import { useMemo, useState } from "react";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "../../base/field";
import { appendPath, toHtmlName } from "../../form-path";
import { BlockAddMenu, type BlockOption } from "../block-add-menu";
import { ROW_ID_KEY } from "../repeater-rows";
import { useRowCollection } from "../use-row-collection";
import { BlockCanvas } from "./canvas";
import { BlockInspector } from "./inspector";
import { useBlockPreview } from "./use-block-preview";

type BlockTemplate = { type: string; label: string; schema: Node[] };

export const BlockEditorComponent: RendererComponent<"field.block-editor"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const blocks = ((node as unknown as { blocks?: BlockTemplate[] }).blocks ??
    []) as BlockTemplate[];
  const rendered = ((node as unknown as { rendered?: Node[][] }).rendered ?? []) as Node[][];

  const { path, rows, onField, append } = useRowCollection(name, props.defaultItems ?? 0);

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

  const selectedIndex = rows.findIndex((row) => String(row[ROW_ID_KEY]) === selectedId);
  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null;
  const selectedTemplate = selectedRow ? templateFor(selectedRow.type) : undefined;

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

      <div className="grid grid-cols-[1fr_18rem] gap-4">
        <div className="flex flex-col gap-3">
          <BlockCanvas
            rows={rows}
            wireFor={wireFor}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <BlockAddMenu
            addLabel={props.addLabel ?? "Add"}
            blocks={options}
            onSelect={(type) => append({ type })}
          />
        </div>

        <div data-test="block-editor-inspector">
          {selectedRow ? (
            <BlockInspector
              base={path}
              index={selectedIndex}
              row={selectedRow}
              template={selectedTemplate?.schema}
              onField={onField}
              onCommit={() =>
                refresh(
                  String(selectedRow[ROW_ID_KEY]),
                  String(selectedRow.type),
                  Object.fromEntries(Object.entries(selectedRow).filter(([k]) => k !== ROW_ID_KEY)),
                )
              }
            />
          ) : (
            <p className="text-sm text-lt-muted-fg">Select a block to edit it.</p>
          )}
        </div>
      </div>
    </FormFieldFrame>
  );
};
