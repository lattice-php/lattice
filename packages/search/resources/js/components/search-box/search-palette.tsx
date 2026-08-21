import { useEffect, useId, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@lattice-php/ui/primitives/dialog";
import { useT } from "@lattice-php/ui/i18n";
import { MODAL_MISSING_ERROR, useEmbeddedModal } from "@lattice-php/ui/components/modal/modal-host";
import { SearchProvider, useSearchContext } from "../../context";
import { useSearch } from "../../use-search";
import { SearchCategories } from "../categories/categories";
import { SearchInput } from "../input/input";
import { SearchPreview } from "../preview/preview";
import { SearchRecent } from "../recent/recent";
import { SearchResults } from "../results/results";

function DefaultComposition(): ReactNode {
  const { query } = useSearchContext();
  const expanded = query.trim() !== "";

  if (!expanded) {
    return (
      <div className="flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col">
        <SearchInput />
        <SearchRecent />
      </div>
    );
  }

  return (
    <div className="flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col">
      <SearchInput />
      <div className="grid min-h-80 flex-1 grid-rows-[auto_1fr] md:grid-cols-[12rem_minmax(0,1fr)_16rem] md:grid-rows-1">
        <div className="border-b border-lt-border md:border-e md:border-b-0">
          <SearchCategories />
        </div>
        <div className="min-h-0 overflow-hidden">
          <SearchResults />
        </div>
        <div className="hidden border-s border-lt-border md:block">
          <SearchPreview />
        </div>
      </div>
    </div>
  );
}

export type SearchPaletteProps = {
  endpoint: string;
  perPage?: number;
  placeholder?: string | null;
  title?: string | null;
  /** Replaces the default input/categories/results/preview composition. */
  children?: ReactNode;
  onClosed?: () => void;
};

/**
 * The command palette behind `SearchBox`. Renders through the embedded modal
 * host it was opened in, so mount it via `useModal().open(...)`.
 */
export function SearchPalette({
  endpoint,
  perPage,
  placeholder,
  title,
  children,
  onClosed,
}: SearchPaletteProps): ReactNode {
  const context = useEmbeddedModal();

  if (!context) {
    throw new Error(MODAL_MISSING_ERROR);
  }

  const { t } = useT("search");
  const search = useSearch({ endpoint, perPage });
  const instanceId = useId();
  const placeholderText = placeholder ?? t("search.placeholder", "Search…");
  const titleText = title ?? t("search.title", "Search");
  const { refreshRecent } = search;

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent]);

  return (
    <Dialog open={context.open} onOpenChange={context.onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0"
        onCloseAutoFocus={(event) => {
          context.onExited(event);
          onClosed?.();
        }}
        width="3xl"
      >
        <DialogTitle className="sr-only">{titleText}</DialogTitle>
        <SearchProvider value={{ ...search, instanceId, placeholder: placeholderText }}>
          {children ?? <DefaultComposition />}
        </SearchProvider>
      </DialogContent>
    </Dialog>
  );
}
