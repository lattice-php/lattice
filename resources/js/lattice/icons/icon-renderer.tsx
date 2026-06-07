import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LucideIconName = (typeof iconNames)[number];

export type LatticeIconRendererProps = {
  className?: string;
  icon: string;
};

export type LatticeIconRenderer = (props: LatticeIconRendererProps) => ReactNode;

type IconRendererProviderProps = {
  children: ReactNode;
  mode?: "replace" | "stack";
  renderer: LatticeIconRenderer;
};

const lucideIconNames = new Set<string>(iconNames);
const IconRenderersContext = createContext<LatticeIconRenderer[]>([renderLucideIcon]);

export function IconRendererProvider({
  children,
  mode = "stack",
  renderer,
}: IconRendererProviderProps) {
  const parentRenderers = useContext(IconRenderersContext);
  const renderers = useMemo(
    () => (mode === "replace" ? [renderer] : [renderer, ...parentRenderers]),
    [mode, parentRenderers, renderer],
  );

  return (
    <IconRenderersContext.Provider value={renderers}>{children}</IconRenderersContext.Provider>
  );
}

export function IconRenderer({ className, icon }: LatticeIconRendererProps) {
  const renderers = useContext(IconRenderersContext);

  for (const renderer of renderers) {
    const rendered = renderer({ className, icon });

    if (rendered !== null && rendered !== undefined && rendered !== false) {
      return rendered;
    }
  }

  return null;
}

function renderLucideIcon({ className, icon }: LatticeIconRendererProps) {
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
