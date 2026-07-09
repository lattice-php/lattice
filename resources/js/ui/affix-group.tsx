import type { ReactNode } from "react";
import type { Affix } from "@lattice-php/lattice/types/generated";
import { IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";

function AffixSegment({ affix, side }: { affix: Affix; side: "start" | "end" }) {
  return (
    <span
      data-slot={`affix-${side}`}
      className={cn(
        "inline-flex h-lt-control-md shrink-0 items-center border border-lt-input bg-lt-muted px-3 text-base whitespace-nowrap text-lt-muted-fg",
        "group-has-[:focus-visible]:border-lt-ring",
        side === "start" ? "rounded-l-lt-sm border-r-0" : "rounded-r-lt-sm border-l-0",
      )}
    >
      {affix.icon ? <IconRenderer className="size-lt-icon-md" icon={affix.icon} /> : affix.text}
    </span>
  );
}

/**
 * Wraps a single-line control in a prefix/suffix input group. The control is a
 * render prop receiving the class names that square the corners adjacent to an
 * affix; with no affixes the control renders untouched.
 *
 * The focus ring lives on the group, not the bare input, so it surrounds the
 * whole control — affixes included — instead of being clipped by the opaque
 * affix segments. The control itself stays the focus target; only its own ring
 * is suppressed.
 */
export function AffixGroup({
  prefix,
  suffix,
  children,
}: {
  prefix?: Affix | null;
  suffix?: Affix | null;
  children: (controlClassName: string) => ReactNode;
}) {
  if (!prefix && !suffix) {
    return children("");
  }

  return (
    <div
      className="group flex w-full rounded-lt-sm transition-[color,box-shadow] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-lt-ring/50"
      data-slot="affix-group"
    >
      {prefix ? <AffixSegment affix={prefix} side="start" /> : null}
      <div className="min-w-0 flex-1">
        {children(
          cn("focus-visible:ring-0", prefix && "rounded-l-none", suffix && "rounded-r-none"),
        )}
      </div>
      {suffix ? <AffixSegment affix={suffix} side="end" /> : null}
    </div>
  );
}
