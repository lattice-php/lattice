import { useEffect, useId, useState, type ReactNode } from "react";
import { useCollapsed } from "@lattice-php/core/collapsed-context";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import { Dialog, DialogContent, DialogTitle } from "@lattice-php/ui/dialog";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
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

function isEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
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

const SearchBox: RendererComponent<"search.box"> = ({ node, children }) => {
  const { endpoint, placeholder, title, shortcut, perPage } = node.props;
  const { t } = useT("search");
  const collapsed = useCollapsed();
  const [open, setOpen] = useState(false);
  const instanceId = useId();
  const search = useSearch({ endpoint, perPage });
  const placeholderText = placeholder ?? t("search.placeholder", "Search…");
  const titleText = title ?? t("search.title", "Search");

  useEffect(() => {
    if (!shortcut) {
      return;
    }

    function openWithShortcut(event: KeyboardEvent): void {
      if (
        !event.repeat &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !isEditingTarget(event.target)
      ) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", openWithShortcut);

    return () => window.removeEventListener("keydown", openWithShortcut);
  }, [shortcut]);

  const { refreshRecent } = search;

  useEffect(() => {
    if (open) {
      refreshRecent();
    }
  }, [open, refreshRecent]);

  const content = node.schema?.length ? children : (children ?? <DefaultComposition />);

  return (
    <>
      <button
        {...(shortcut ? { "aria-keyshortcuts": "Meta+K Control+K" } : {})}
        {...(collapsed ? { "aria-label": placeholderText } : {})}
        className={
          collapsed
            ? "flex size-9 items-center justify-center rounded-lt border border-lt-border bg-lt-bg text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]"
            : "flex min-h-11 w-full max-w-sm items-center gap-2 rounded-lt border border-lt-border bg-lt-bg px-3 text-sm text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]"
        }
        data-test="search-trigger"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Icon name="search" aria-hidden="true" className="size-lt-icon-sm" />
        {collapsed ? null : (
          <span className="min-w-0 flex-1 truncate text-start">{placeholderText}</span>
        )}
        {!collapsed && shortcut ? (
          <kbd className="rounded-lt-xs border border-lt-border px-1.5 py-0.5 text-xs">⌘K</kbd>
        ) : null}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0" width="3xl">
          <DialogTitle className="sr-only">{titleText}</DialogTitle>
          <SearchProvider value={{ ...search, instanceId, placeholder: placeholderText }}>
            {content}
          </SearchProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchBox;
