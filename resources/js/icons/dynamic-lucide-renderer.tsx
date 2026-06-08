import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import type { IconRendererProps } from "@/lattice";

type LucideIconName = (typeof iconNames)[number];

const lucideIconNames = new Set<string>(iconNames);

export function renderDynamicLucideIcon({ className, icon }: IconRendererProps) {
  if (!lucideIconNames.has(icon)) {
    return null;
  }

  return (
    <DynamicIcon
      aria-hidden="true"
      className={cn("size-4", className)}
      fallback={() => null}
      name={icon as LucideIconName}
    />
  );
}
