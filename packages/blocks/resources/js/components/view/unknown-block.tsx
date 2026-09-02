import { useT } from "@lattice-php/ui/i18n";

export function UnknownBlock({ blockType }: { blockType: string }) {
  const { t } = useT("blocks");

  return (
    <div
      className="rounded-lt border border-dashed border-lt-border bg-lt-muted px-4 py-3 text-sm text-lt-muted-fg"
      data-test="blocks-unknown"
      role="note"
    >
      {t("blocks.editor.unknown-block", "Unknown block: {{type}}", { type: blockType })}
    </div>
  );
}
