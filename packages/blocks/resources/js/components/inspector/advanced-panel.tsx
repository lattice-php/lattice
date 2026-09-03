import { useId } from "react";
import { Input } from "@lattice-php/form/primitives/input";
import { useT } from "@lattice-php/ui/i18n";
import { updateStyle } from "../../document/store";
import type { BlockStyle, BlockSupports } from "../../types";
import { useEditor } from "../editor/editor-context";
import { FieldRow, Section } from "./field-row";

export function AdvancedPanel({
  id,
  style,
  supports,
}: {
  id: string;
  style: BlockStyle;
  supports: BlockSupports;
}) {
  const { t } = useT("blocks");
  const { store } = useEditor();
  const inputId = useId();

  return (
    <div data-test="blocks-advanced-panel">
      {supports.anchor && (
        <Section title={t("blocks.editor.inspector.anchor", "HTML anchor")}>
          <FieldRow label={t("blocks.editor.inspector.anchor-id", "ID")} htmlFor={inputId}>
            <Input
              id={inputId}
              density="compact"
              value={style.anchor ?? ""}
              data-test="blocks-style-anchor"
              onChange={(event) =>
                store.setState((state) =>
                  updateStyle(state, id, {
                    anchor: event.target.value.trim() === "" ? null : event.target.value.trim(),
                  }),
                )
              }
            />
          </FieldRow>
          <p className="text-xs text-lt-muted-fg">
            {t("blocks.editor.inspector.anchor-help", "Lets you link directly to this block.")}
          </p>
        </Section>
      )}
      <Section title={t("blocks.editor.inspector.block-id", "Block ID")}>
        <code className="text-xs text-lt-muted-fg">{id}</code>
      </Section>
    </div>
  );
}
