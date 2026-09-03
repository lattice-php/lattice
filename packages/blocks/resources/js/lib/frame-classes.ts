import type { BlockStyle, FrameClasses, StyleClasses } from "../types";

/** The frame classes a block style resolves to, mirroring the server's StyleClassMap. */
export function frameClasses(map: StyleClasses, style: BlockStyle): FrameClasses {
  const background =
    style.background && style.background !== "none"
      ? `${map.background[style.background] ?? ""} ${map.backgroundPadding}`.trim()
      : null;
  const outer = [
    style.marginTop ? map.marginTop[style.marginTop] : null,
    style.marginBottom ? map.marginBottom[style.marginBottom] : null,
    style.paddingTop ? map.paddingTop[style.paddingTop] : null,
    style.paddingBottom ? map.paddingBottom[style.paddingBottom] : null,
    background,
    style.hideOnMobile ? map.hideOnMobile : null,
    style.hideOnDesktop ? map.hideOnDesktop : null,
    style.align ? map.align[style.align] : null,
  ];

  return {
    inner: map.width[style.width ?? "full"] ?? "",
    outer: outer.filter((entry) => entry).join(" "),
  };
}
