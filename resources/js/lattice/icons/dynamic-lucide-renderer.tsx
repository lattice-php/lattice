import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import type { LatticeIconRendererProps } from "./icon-renderer";

type LucideIconName = (typeof iconNames)[number];

const lucideIconNames = new Set<string>(iconNames);

export function renderDynamicLucideIcon({ className, icon }: LatticeIconRendererProps) {
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
