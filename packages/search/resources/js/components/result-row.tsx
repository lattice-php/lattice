import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import type { SearchResult } from "../types";

function secondaryText(result: SearchResult): string {
  return [result.item.subtitle, result.item.additionalInfo]
    .filter((value): value is string => value !== null && value !== "")
    .join(" · ");
}

export function ResultRow({
  result,
  focused,
  onOpen,
  onFocus,
  id,
  tabIndex = -1,
}: {
  result: SearchResult;
  focused: boolean;
  onOpen: () => void;
  onFocus: () => void;
  id: string;
  tabIndex?: 0 | -1;
}) {
  const detail = secondaryText(result);

  return (
    <button
      aria-selected={focused}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-lt-sm px-3 py-2 text-start",
        focused ? "bg-lt-muted" : "hover:bg-lt-muted/60",
      )}
      data-test={`search-result-${result.category.name}-${result.item.id}`}
      id={id}
      onClick={onOpen}
      onFocus={onFocus}
      onMouseEnter={onFocus}
      role="option"
      tabIndex={tabIndex}
      type="button"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-lt-fg">{result.item.title}</span>
          {result.item.badge ? (
            <span className="rounded-lt-xs bg-lt-accent px-1.5 py-0.5 text-xs text-lt-accent-fg">
              {result.item.badge}
            </span>
          ) : null}
        </span>
        {detail !== "" ? (
          <span className="block truncate text-xs text-lt-muted-fg">{detail}</span>
        ) : null}
      </span>
      {focused ? (
        <Icon
          name="arrow-down"
          aria-hidden="true"
          className="size-lt-icon-sm -rotate-90 text-lt-muted-fg"
        />
      ) : null}
    </button>
  );
}
