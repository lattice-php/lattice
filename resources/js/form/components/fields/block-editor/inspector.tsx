import type { Node } from "@lattice-php/lattice/core/types";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { useT } from "@lattice-php/lattice/i18n";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import type { RepeaterRow } from "@lattice-php/lattice/form/components/fields/repeater-rows";

type Props = {
  base: string;
  index: number;
  row: RepeaterRow;
  template?: Node[];
  onField: (field: string, value: unknown) => void;
  onCommit: () => void;
};

export function BlockInspector({ base, index, row, template, onField, onCommit }: Props) {
  const { t } = useT("lattice");

  if (!template) {
    return (
      <div data-test="block-inspector-unknown" className="text-sm text-lt-muted-fg">
        {t("form.block-editor.unknown-block", "Unknown block")}
      </div>
    );
  }

  if (template.length === 0) {
    return (
      <p data-test="block-inspector" className="text-sm text-lt-muted-fg">
        {t("form.block-editor.no-settings", "This block has no settings.")}
      </p>
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
      <FieldScopeProvider base={base} index={index} row={row} onChange={onField}>
        <div className="flex flex-col gap-4">
          {template.map((child) => (
            <RenderNode key={child.key ?? child.id} node={child} />
          ))}
        </div>
      </FieldScopeProvider>
    </div>
  );
}
