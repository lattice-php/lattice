import { useId } from "react";
import { Checkbox } from "@lattice-php/form/components/checkbox/checkbox";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { NativeSelect } from "@lattice-php/ui/primitives/native-select";
import { useT } from "@lattice-php/ui/i18n";
import type { Gap } from "@lattice-php/ui";
import { updateStyle } from "../../document/store";
import type { BlockBackground, BlockStyle, BlockSupports, BlockWidth } from "../../types";
import { useEditor } from "../editor/editor-context";
import { FieldRow, Section } from "./field-row";

const gaps: Gap[] = ["none", "xs", "sm", "md", "lg", "xl"];

export function StylePanel({
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
  const ids = useId();
  const patch = (next: Partial<BlockStyle>) =>
    store.setState((state) => updateStyle(state, id, next));
  const nothing =
    !supports.width &&
    !supports.spacing &&
    !supports.background &&
    !supports.align &&
    !supports.visibility;

  if (nothing) {
    return (
      <p className="px-3 py-3 text-sm text-lt-muted-fg">
        {t("blocks.editor.inspector.no-style-options", "This block has no style options.")}
      </p>
    );
  }

  const spacing = (
    key: "paddingTop" | "paddingBottom" | "marginTop" | "marginBottom",
    label: string,
  ) => (
    <FieldRow label={label} htmlFor={`${ids}-${key}`}>
      <NativeSelect
        id={`${ids}-${key}`}
        density="compact"
        value={style[key] ?? ""}
        data-test={`blocks-style-${key}`}
        onChange={(event) =>
          patch({ [key]: event.target.value === "" ? null : (event.target.value as Gap) })
        }
      >
        <option value="">{t("blocks.editor.inspector.spacing-default", "Default")}</option>
        {gaps.map((gap) => (
          <option key={gap} value={gap}>
            {gap}
          </option>
        ))}
      </NativeSelect>
    </FieldRow>
  );

  return (
    <div data-test="blocks-style-panel">
      {supports.width && (
        <Section title={t("blocks.editor.inspector.width", "Width")}>
          <SegmentedControl
            aria-label={t("blocks.editor.inspector.width", "Width")}
            data-test="blocks-style-width"
            value={style.width ?? "full"}
            onValueChange={(value) => patch({ width: value as BlockWidth })}
            options={[
              { label: t("blocks.editor.inspector.width-content", "Content"), value: "content" },
              { label: t("blocks.editor.inspector.width-wide", "Wide"), value: "wide" },
              { label: t("blocks.editor.inspector.width-full", "Full"), value: "full" },
            ]}
          />
        </Section>
      )}
      {supports.spacing && (
        <Section title={t("blocks.editor.inspector.spacing", "Spacing")}>
          {spacing("paddingTop", t("blocks.editor.inspector.padding-top", "Padding top"))}
          {spacing("paddingBottom", t("blocks.editor.inspector.padding-bottom", "Padding bottom"))}
          {spacing("marginTop", t("blocks.editor.inspector.margin-top", "Margin top"))}
          {spacing("marginBottom", t("blocks.editor.inspector.margin-bottom", "Margin bottom"))}
        </Section>
      )}
      {supports.background && (
        <Section title={t("blocks.editor.inspector.background", "Background")}>
          <SegmentedControl
            aria-label={t("blocks.editor.inspector.background", "Background")}
            data-test="blocks-style-background"
            value={style.background ?? "none"}
            onValueChange={(value) => patch({ background: value as BlockBackground })}
            options={[
              { label: t("blocks.editor.inspector.background-none", "None"), value: "none" },
              { label: t("blocks.editor.inspector.background-muted", "Muted"), value: "muted" },
              {
                label: t("blocks.editor.inspector.background-inverted", "Inverted"),
                value: "inverted",
              },
              {
                label: t("blocks.editor.inspector.background-primary", "Primary"),
                value: "primary",
              },
            ]}
          />
        </Section>
      )}
      {supports.align && (
        <Section title={t("blocks.editor.inspector.align", "Alignment")}>
          <SegmentedControl
            aria-label={t("blocks.editor.inspector.align", "Alignment")}
            data-test="blocks-style-align"
            value={style.align ?? "start"}
            onValueChange={(value) => patch({ align: value as BlockStyle["align"] })}
            options={[
              { label: t("blocks.editor.inspector.align-start", "Start"), value: "start" },
              { label: t("blocks.editor.inspector.align-center", "Center"), value: "center" },
            ]}
          />
        </Section>
      )}
      {supports.visibility && (
        <Section title={t("blocks.editor.inspector.visibility", "Visibility")}>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={style.hideOnMobile}
              data-test="blocks-style-hide-mobile"
              onCheckedChange={(checked) => patch({ hideOnMobile: checked === true })}
            />
            {t("blocks.editor.inspector.hide-on-mobile", "Hide on mobile")}
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={style.hideOnDesktop}
              data-test="blocks-style-hide-desktop"
              onCheckedChange={(checked) => patch({ hideOnDesktop: checked === true })}
            />
            {t("blocks.editor.inspector.hide-on-desktop", "Hide on desktop")}
          </label>
        </Section>
      )}
    </div>
  );
}
