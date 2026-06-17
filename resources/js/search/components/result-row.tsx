import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { SearchResult } from "../types";

function secondary(item: SearchResult["item"]): string {
  return [item.subtitle, item.additionalInfo]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
}

export function ResultRow({
  result,
  focused,
  onOpen,
  onFocus,
}: {
  result: SearchResult;
  focused: boolean;
  onOpen: () => void;
  onFocus: () => void;
}) {
  const detail = secondary(result.item);

  return (
    <button
      aria-selected={focused}
      className={cn(
        "flex w-full items-center gap-3 rounded-lt-sm px-3 py-2 text-left",
        focused ? "bg-lt-muted" : "hover:bg-lt-muted/60",
      )}
      onClick={onOpen}
      onMouseEnter={onFocus}
      role="option"
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
          className="size-lt-icon-sm rotate-90 text-lt-muted-fg"
        />
      ) : null}
    </button>
  );
}
