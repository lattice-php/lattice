import { Button } from "@lattice-php/lattice/core/components/button";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { useGlobalSearchContext } from "../context";

const GlobalSearchPreview: RendererComponent<"global-search.preview"> = () => {
  const { results, recent, focusedId, openResult } = useGlobalSearchContext();
  const { t } = useT("lattice");

  const focused = [...results, ...recent].find((result) => result.item.id === focusedId) ?? null;

  if (focused === null) {
    return <div className="hidden p-4 text-sm text-lt-muted-fg md:block">{t("globalSearch.previewEmpty", "Select a result to preview.")}</div>;
  }

  const detail = [focused.item.subtitle, focused.item.additionalInfo].filter(Boolean).join(" · ");

  return (
    <div className="hidden flex-col gap-3 p-4 md:flex">
      <div className="grid gap-1">
        <span className="text-base font-semibold text-lt-fg">{focused.item.title}</span>
        {detail !== "" ? <span className="text-sm text-lt-muted-fg">{detail}</span> : null}
        {focused.item.badge ? <span className="w-fit rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg">{focused.item.badge}</span> : null}
      </div>
      <Button onClick={() => openResult(focused)} variant="secondary">{t("globalSearch.open", "Open")}</Button>
    </div>
  );
};

export default GlobalSearchPreview;
