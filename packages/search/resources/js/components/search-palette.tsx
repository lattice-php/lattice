import { useEffect, useId, type ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import { Dialog, DialogContent, DialogTitle } from "@lattice-php/ui/dialog";
import { useT } from "@lattice-php/ui/i18n";
import { MODAL_HOST_MISSING_ERROR, useEmbeddedModal } from "@lattice-php/ui/modal-host";
import { SearchProvider, useSearchContext } from "../context";
import type { SearchNodeType } from "../types";
import { useSearch } from "../use-search";
import SearchCategories from "./categories";
import SearchInput from "./input";
import SearchPreview from "./preview";
import SearchRecent from "./recent";
import SearchResults from "./results";

function slotNode<TType extends SearchNodeType>(type: TType): Node<TType> {
  return { type, props: {} } as Node<TType>;
}

function DefaultComposition(): ReactNode {
  const { query } = useSearchContext();
  const expanded = query.trim() !== "";

  if (!expanded) {
    return (
      <div className="flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col">
        <SearchInput node={slotNode("search.input")}>{null}</SearchInput>
        <SearchRecent node={slotNode("search.recent")}>{null}</SearchRecent>
      </div>
    );
  }

  return (
    <div className="flex max-h-[min(36rem,calc(100dvh-2rem))] flex-col">
      <SearchInput node={slotNode("search.input")}>{null}</SearchInput>
      <div className="grid min-h-80 flex-1 grid-rows-[auto_1fr] md:grid-cols-[12rem_minmax(0,1fr)_16rem] md:grid-rows-1">
        <div className="border-b border-lt-border md:border-e md:border-b-0">
          <SearchCategories node={slotNode("search.categories")}>{null}</SearchCategories>
        </div>
        <div className="min-h-0 overflow-hidden">
          <SearchResults node={slotNode("search.results")}>{null}</SearchResults>
        </div>
        <div className="hidden border-s border-lt-border md:block">
          <SearchPreview node={slotNode("search.preview")}>{null}</SearchPreview>
        </div>
      </div>
    </div>
  );
}

export default function SearchPalette({
  node,
  children,
  onClosed,
}: {
  node: Node<"search.box">;
  children: ReactNode;
  onClosed: () => void;
}): ReactNode {
  const context = useEmbeddedModal();

  if (!context) {
    throw new Error(MODAL_HOST_MISSING_ERROR);
  }

  const { endpoint, perPage, placeholder, title } = node.props;
  const { t } = useT("search");
  const search = useSearch({ endpoint, perPage });
  const instanceId = useId();
  const placeholderText = placeholder ?? t("search.placeholder", "Search…");
  const titleText = title ?? t("search.title", "Search");
  const content = node.schema?.length ? children : (children ?? <DefaultComposition />);
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
          onClosed();
        }}
        width="3xl"
      >
        <DialogTitle className="sr-only">{titleText}</DialogTitle>
        <SearchProvider value={{ ...search, instanceId, placeholder: placeholderText }}>
          {content}
        </SearchProvider>
      </DialogContent>
    </Dialog>
  );
}
