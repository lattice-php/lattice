import { ReactNode } from "react";
export interface KnownIcons {}
export type IconName = keyof KnownIcons | (string & {});
export type SpriteValue = {
  /** The sprite URL. Empty when the sprite is inlined into the document (dev). */
  href: string;
  /** Every symbol id in the sprite, or undefined when not yet wired/known. */
  ids?: readonly string[];
  /** Inline sprite markup to inject once (dev); empty/omitted in builds. */
  source?: string;
};
/**
 * Seeds the icon sprite for everything below it. When `sprite.source` is set
 * (dev), it's injected once so same-document `<use href="#id">` references
 * resolve; in builds `href` points at the emitted sprite asset instead.
 */
export declare function SpriteProvider({
  children,
  sprite,
}: {
  children: ReactNode;
  sprite: SpriteValue;
}): import("react").JSX.Element;
export declare function useSprite(): SpriteValue;
/**
 * Renders a single sprite symbol by name. Used for Lattice's own UI chrome and
 * as the resolved default for server-driven icons. Extra `<svg>` props are
 * forwarded, so callers can override `aria-hidden`, set a `role`, etc.
 */
export declare function Icon({
  className,
  name,
  ...props
}: {
  name: IconName;
} & React.ComponentProps<"svg">): import("react").JSX.Element;
