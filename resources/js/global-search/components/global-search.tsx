import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@lattice-php/lattice/core/components/dialog";
import { Icon } from "@lattice-php/lattice/icons";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { GlobalSearchProvider } from "../context";
import { useGlobalSearch } from "../use-global-search";
import GlobalSearchCategories from "./categories";
import GlobalSearchInput from "./input";
import GlobalSearchPreview from "./preview";
import GlobalSearchRecent from "./recent";
import GlobalSearchResults from "./results";

function isEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;

  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function DefaultComposition() {
  const passthrough = { type: "global-search.slot", props: {} } as never;

  return (
    <div className="flex h-[28rem] flex-col">
      <GlobalSearchInput node={passthrough}>{null}</GlobalSearchInput>
      <GlobalSearchRecent node={passthrough}>{null}</GlobalSearchRecent>
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[12rem_1fr_16rem]">
        <div className="hidden border-r border-lt-border md:block">
          <GlobalSearchCategories node={passthrough}>{null}</GlobalSearchCategories>
        </div>
        <div className="min-h-0">
          <GlobalSearchResults node={passthrough}>{null}</GlobalSearchResults>
        </div>
        <div className="hidden border-l border-lt-border md:block">
          <GlobalSearchPreview node={passthrough}>{null}</GlobalSearchPreview>
        </div>
      </div>
    </div>
  );
}

const GlobalSearch: RendererComponent<"global-search.root"> = ({ node, children }) => {
  const { endpoint, placeholder, title, shortcut, perPage } = node.props;
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);
  const search = useGlobalSearch({
    endpoint: endpoint ?? "/lattice/global-search",
    perPage: perPage ?? 20,
  });

  useEffect(() => {
    if (shortcut === false) {
      return;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (isEditingTarget(event.target)) {
          return;
        }

        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  useEffect(() => {
    if (open) {
      search.refreshRecent();
    }
  }, [open, search]);

  const composed: ReactNode = node.schema?.length ? children : (children ?? <DefaultComposition />);

  return (
    <>
      <button
        className="flex w-full max-w-sm items-center gap-2 rounded-lt border border-lt-border bg-lt-bg px-3 py-1.5 text-sm text-lt-muted-fg hover:bg-lt-muted/60"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Icon name="search" aria-hidden="true" className="size-lt-icon-sm" />
        <span className="flex-1 text-left">
          {placeholder ?? t("globalSearch.placeholder", "Search…")}
        </span>
        <kbd className="rounded-lt-xs border border-lt-border px-1.5 text-xs">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-label={title ?? t("globalSearch.title", "Search")}
          className="w-[44rem] max-w-[calc(100vw-2rem)] p-0"
        >
          <GlobalSearchProvider value={search}>{composed}</GlobalSearchProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
