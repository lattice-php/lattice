import { Button } from "@lattice-php/ui/components/button/button";
import { useT } from "@lattice-php/ui/i18n";
import { useSearchContext } from "../../context";
import { searchResultKey } from "../../use-search";

export type SearchPreviewProps = {
  "data-test"?: string;
};

export function SearchPreview({ "data-test": testId }: SearchPreviewProps = {}) {
  const { results, recent, focusedKey, openResult } = useSearchContext();
  const { t } = useT("search");
  const focused = [...results, ...recent].find((result) => searchResultKey(result) === focusedKey);

  if (!focused) {
    return (
      <div data-test={testId} className="p-4 text-sm text-lt-muted-fg">
        {t("search.preview-empty", "Select a result to preview.")}
      </div>
    );
  }

  const detail = [focused.item.subtitle, focused.item.additionalInfo]
    .filter((value): value is string => value !== null && value !== "")
    .join(" · ");

  return (
    <div data-test={testId} className="flex flex-col gap-4 p-4">
      <div className="grid gap-1">
        <span className="text-base font-semibold text-lt-fg">{focused.item.title}</span>
        {detail !== "" ? <span className="text-sm text-lt-muted-fg">{detail}</span> : null}
        {focused.item.badge ? (
          <span className="w-fit rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg">
            {focused.item.badge}
          </span>
        ) : null}
      </div>
      <Button emphasis="outline" onClick={() => openResult(focused)} variant="secondary">
        {t("search.open", "Open")}
      </Button>
    </div>
  );
}
