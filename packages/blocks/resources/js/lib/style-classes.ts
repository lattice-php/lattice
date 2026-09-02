import type { BlockBackground, BlockStyle, BlockWidth } from "../types";
import type { Gap, TextAlign } from "@lattice-php/ui";

export const blockWidths: Record<BlockWidth, string> = {
  content: "mx-auto w-full max-w-3xl",
  full: "w-full",
  wide: "mx-auto w-full max-w-6xl",
};

const paddingTop: Record<Gap, string> = {
  lg: "pt-12",
  md: "pt-8",
  none: "pt-0",
  sm: "pt-4",
  xl: "pt-20",
  xs: "pt-2",
};
const paddingBottom: Record<Gap, string> = {
  lg: "pb-12",
  md: "pb-8",
  none: "pb-0",
  sm: "pb-4",
  xl: "pb-20",
  xs: "pb-2",
};
const marginTop: Record<Gap, string> = {
  lg: "mt-12",
  md: "mt-8",
  none: "mt-0",
  sm: "mt-4",
  xl: "mt-20",
  xs: "mt-2",
};
const marginBottom: Record<Gap, string> = {
  lg: "mb-12",
  md: "mb-8",
  none: "mb-0",
  sm: "mb-4",
  xl: "mb-20",
  xs: "mb-2",
};

export const blockBackgrounds: Record<BlockBackground, string> = {
  inverted: "bg-lt-fg text-lt-bg [&_h1,&_h2,&_h3,&_h4]:text-lt-bg",
  muted: "bg-lt-muted text-lt-fg",
  none: "",
  primary: "bg-lt-primary text-lt-primary-fg [&_h1,&_h2,&_h3,&_h4]:text-lt-primary-fg",
};

const textAlign: Record<TextAlign, string> = {
  center: "text-center [&_.lt-blocks-prose]:mx-auto",
  start: "text-start",
};

const outerWidthRequiresPadding = "px-6";

/** Classes for the block's outer element: spacing, background, visibility. */
export function frameOuterClasses(style: BlockStyle): string {
  return [
    style.marginTop ? marginTop[style.marginTop] : null,
    style.marginBottom ? marginBottom[style.marginBottom] : null,
    style.paddingTop ? paddingTop[style.paddingTop] : null,
    style.paddingBottom ? paddingBottom[style.paddingBottom] : null,
    style.background && style.background !== "none"
      ? `${blockBackgrounds[style.background]} ${outerWidthRequiresPadding}`
      : null,
    style.hideOnMobile ? "max-md:hidden" : null,
    style.hideOnDesktop ? "md:hidden" : null,
    style.align ? textAlign[style.align] : null,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Classes for the block's inner element: the content width. */
export function frameInnerClasses(style: BlockStyle): string {
  return blockWidths[style.width ?? "full"];
}
