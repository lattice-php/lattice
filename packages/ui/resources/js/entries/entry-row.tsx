import type { ReactNode } from "react";
import { Icon } from "../icons";
import { cn } from "../lib/utils";
import { useCollapsibleState } from "../use-collapsible-state";
import { useDescriptionListSemantic } from "./context";

const ROW = "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-lt-gutter py-3";
const LABEL = "text-sm text-lt-muted-fg";
const VALUE = "min-w-0 text-lt-fg";

export type EntryRowProps = {
  children: ReactNode;
  description?: string | null;
  disclosure?: ReactNode;
  identity?: string;
  label: string | null;
};

/**
 * The shared frame every entry renders into: label on one side, value on the
 * other. An entry with disclosure content turns the whole row into the toggle,
 * which is why the list drops to `role="list"` as soon as one exists.
 */
export function EntryRow({
  children,
  description,
  disclosure,
  identity,
  label,
}: EntryRowProps): ReactNode {
  const semantic = useDescriptionListSemantic();
  const panelId = `${identity ?? "entry"}-panel`;
  const [open, toggle] = useCollapsibleState(
    `lattice:entry:${identity ?? "default"}`,
    false,
    false,
  );

  const labelBody = (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span>{label}</span>
      {description && <span className="text-xs text-lt-muted-fg">{description}</span>}
    </span>
  );

  if (!disclosure) {
    if (semantic === "list") {
      return (
        <div className={ROW} data-lattice-component={identity} role="listitem">
          <span className={LABEL}>{labelBody}</span>
          <span className={VALUE}>{children}</span>
        </div>
      );
    }

    return (
      <div className={ROW} data-lattice-component={identity}>
        <dt className={LABEL}>{labelBody}</dt>
        <dd className={VALUE}>{children}</dd>
      </div>
    );
  }

  return (
    <div data-lattice-component={identity} role="listitem">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={cn(ROW, "w-full cursor-pointer text-left transition-colors hover:bg-lt-muted")}
        onClick={toggle}
        type="button"
      >
        <span className={LABEL}>{labelBody}</span>
        <span className="flex min-w-0 items-center gap-2">
          <span className={VALUE}>{children}</span>
          <Icon
            name="chevron-down"
            className={cn(
              "size-lt-icon-md shrink-0 text-lt-muted-fg transition-transform",
              !open && "-rotate-90",
            )}
          />
        </span>
      </button>

      {open && (
        <div className="px-lt-gutter pt-2 pb-4" id={panelId}>
          {disclosure}
        </div>
      )}
    </div>
  );
}
