import type { Node } from "@lattice-php/lattice/core/types";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { FieldScopeProvider } from "../../field-scope";
import type { RepeaterRow } from "../repeater-rows";

type Props = {
  base: string;
  index: number;
  row: RepeaterRow;
  template?: Node[];
  onField: (index: number, field: string, value: unknown) => void;
  onCommit: () => void;
};

export function BlockInspector({ base, index, row, template, onField, onCommit }: Props) {
  if (!template) {
    return (
      <div data-test="block-inspector-unknown" className="text-sm text-lt-muted-fg">
        Unknown block
      </div>
    );
  }

  return (
    <div
      data-test="block-inspector"
      onBlur={(event) => {
        const focusStaysInside =
          event.relatedTarget instanceof Element &&
          event.currentTarget.contains(event.relatedTarget);

        if (!focusStaysInside) {
          onCommit();
        }
      }}
    >
      <FieldScopeProvider
        base={base}
        index={index}
        row={row}
        onChange={(field, value) => onField(index, field, value)}
      >
        <div className="flex flex-col gap-4">
          {template.map((child) => (
            <RenderNode key={child.key ?? child.id} node={child} />
          ))}
        </div>
      </FieldScopeProvider>
    </div>
  );
}
