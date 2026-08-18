import { useCallback, useEffect, useRef } from "react";
import { useCollapsed } from "@lattice-php/core/collapsed-context";
import type { RendererComponent } from "@lattice-php/core/types";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { type ModalHandle, useModal } from "@lattice-php/ui/modal";
import SearchPalette from "./search-palette";

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

const SearchBox: RendererComponent<"search.box"> = ({ node, children }) => {
  const { placeholder, shortcut } = node.props;
  const { t } = useT("search");
  const collapsed = useCollapsed();
  const host = useModal();
  const handleRef = useRef<ModalHandle | null>(null);
  const placeholderText = placeholder ?? t("search.placeholder", "Search…");

  const openPalette = useCallback((): void => {
    if (handleRef.current) {
      return;
    }

    handleRef.current = host.open(
      <SearchPalette
        node={node}
        onClosed={() => {
          handleRef.current = null;
        }}
      >
        {children}
      </SearchPalette>,
    );
  }, [children, host, node]);

  useEffect(() => {
    if (!shortcut) {
      return;
    }

    function openWithShortcut(event: KeyboardEvent): void {
      if (event.repeat || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }

      if (handleRef.current) {
        event.preventDefault();
        handleRef.current.close();

        return;
      }

      if (isEditingTarget(event.target)) {
        return;
      }

      event.preventDefault();
      openPalette();
    }

    window.addEventListener("keydown", openWithShortcut);

    return () => window.removeEventListener("keydown", openWithShortcut);
  }, [openPalette, shortcut]);

  return (
    <button
      {...(shortcut ? { "aria-keyshortcuts": "Meta+K Control+K" } : {})}
      {...(collapsed ? { "aria-label": placeholderText } : {})}
      className={
        collapsed
          ? "flex size-9 items-center justify-center rounded-lt border border-lt-border bg-lt-bg text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]"
          : "flex min-h-11 w-full max-w-sm items-center gap-2 rounded-lt border border-lt-border bg-lt-bg px-3 text-sm text-lt-muted-fg shadow-lt-xs hover:bg-lt-muted/60 focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]"
      }
      data-test="search-trigger"
      onClick={openPalette}
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
  );
};

export default SearchBox;
