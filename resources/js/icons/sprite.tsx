import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type SpriteValue = {
  /** The sprite URL. Empty when the sprite is inlined into the document (dev). */
  href: string;
  /** Every symbol id in the sprite, or undefined when not yet wired/known. */
  ids?: readonly string[];
  /** Inline sprite markup to inject once (dev); empty/omitted in builds. */
  source?: string;
};

const SpriteContext = createContext<SpriteValue>({ href: "" });

/**
 * Seeds the icon sprite for everything below it. When `sprite.source` is set
 * (dev), it's injected once so same-document `<use href="#id">` references
 * resolve; in builds `href` points at the emitted sprite asset instead.
 */
export function SpriteProvider({ children, sprite }: { children: ReactNode; sprite: SpriteValue }) {
  return (
    <SpriteContext.Provider value={sprite}>
      {sprite.source ? <div hidden dangerouslySetInnerHTML={{ __html: sprite.source }} /> : null}
      {children}
    </SpriteContext.Provider>
  );
}

export function useSprite(): SpriteValue {
  return useContext(SpriteContext);
}

const warnedIcons = new Set<string>();

/**
 * Renders a single sprite symbol by name. Used for Lattice's own UI chrome and
 * as the resolved default for server-driven icons. Extra `<svg>` props are
 * forwarded, so callers can override `aria-hidden`, set a `role`, etc.
 */
export function Icon({
  className,
  name,
  ...props
}: { name: string } & React.ComponentProps<"svg">) {
  const { href, ids } = useSprite();

  if (import.meta.env.DEV && ids && !ids.includes(name) && !warnedIcons.has(name)) {
    warnedIcons.add(name);
    console.warn(`[Lattice] Icon "${name}" is not in the sprite.`);
  }

  return (
    <svg aria-hidden="true" {...props} className={cn("size-4", className)}>
      <use href={`${href}#${name}`} />
    </svg>
  );
}
