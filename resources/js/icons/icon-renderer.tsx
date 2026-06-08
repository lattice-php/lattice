import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { renderBundledIcon, renderMissingIcon } from "./default-icons";

export type IconRendererProps = {
  className?: string;
  icon: string;
};

export type IconRendererFunction = (props: IconRendererProps) => ReactNode;

type IconRendererProviderProps = {
  children: ReactNode;
  mode?: "replace" | "stack";
  renderer: IconRendererFunction;
};

const IconRenderersContext = createContext<IconRendererFunction[]>([renderBundledIcon]);
const loggedMissingIcons = new Set<string>();

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

export function IconRenderer({ className, icon }: IconRendererProps) {
  const renderers = useContext(IconRenderersContext);

  for (const renderer of renderers) {
    const rendered = renderer({ className, icon });

    if (rendered !== null && rendered !== undefined && rendered !== false) {
      return rendered;
    }
  }

  logMissingIcon(icon);

  return renderMissingIcon({ className, icon });
}

function logMissingIcon(icon: string): void {
  if (!import.meta.env.DEV || loggedMissingIcons.has(icon)) {
    return;
  }

  loggedMissingIcons.add(icon);
  console.log(`[Lattice] Missing icon renderer for "${icon}".`);
}
