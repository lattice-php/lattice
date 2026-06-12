import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, useSprite } from "./sprite";

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

const IconRenderersContext = createContext<IconRendererFunction[]>([]);
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
  const { ids } = useSprite();

  // Custom renderers (the override stack) take precedence over the sprite.
  for (const renderer of renderers) {
    const rendered = renderer({ className, icon });

    if (rendered !== null && rendered !== undefined && rendered !== false) {
      return rendered;
    }
  }

  // When the sprite is wired and the icon is genuinely absent, show a visible
  // marker. When `ids` is unknown (not yet wired), optimistically emit the
  // sprite reference rather than crying wolf.
  if (ids && !ids.includes(icon)) {
    logMissingIcon(icon);
    return <MissingIcon className={className} />;
  }

  return <Icon className={className} name={icon} />;
}

function MissingIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-4 text-lt-muted-fg", className)}
      data-lattice-missing-icon=""
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function logMissingIcon(icon: string): void {
  if (!import.meta.env.DEV || loggedMissingIcons.has(icon)) {
    return;
  }

  loggedMissingIcons.add(icon);
  console.log(`[Lattice] Missing icon renderer for "${icon}".`);
}
