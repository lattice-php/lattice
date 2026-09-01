import type { HTMLAttributes, ReactNode } from "react";
import { DescriptionListProvider } from "./context";
import { cn } from "../../lib/utils";
import type { DescriptionListSemantic } from "../../generated";

export type { DescriptionListSemantic } from "../../generated";

export type DescriptionListProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  bleed?: boolean;
  children?: ReactNode;
  divided?: boolean;
  emptyLabel?: ReactNode;
  semantic?: DescriptionListSemantic;
};

export function DescriptionList({
  bleed = false,
  children,
  className,
  divided = false,
  emptyLabel,
  semantic = "description-list",
  ...props
}: DescriptionListProps) {
  const isDescriptionList = semantic === "description-list";
  const listClassName = cn(
    "w-full",
    divided && "divide-y divide-lt-border",
    // `w-auto` lets negative margins expand the list to both padded edges instead of only shifting it left.
    bleed && "-mx-lt-gutter w-auto",
    className,
  );
  const body =
    children ??
    (emptyLabel ? (
      <p className="px-lt-gutter py-3 text-sm text-lt-muted-fg">{emptyLabel}</p>
    ) : null);

  return (
    <DescriptionListProvider value={semantic}>
      {isDescriptionList ? (
        <dl {...props} className={listClassName} data-slot="description-list">
          {body}
        </dl>
      ) : (
        <div {...props} className={listClassName} data-slot="description-list" role="list">
          {body}
        </div>
      )}
    </DescriptionListProvider>
  );
}
