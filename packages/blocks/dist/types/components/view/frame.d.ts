import { ReactNode } from "react";
import { BlockStyle } from "../../types";
export type FrameProps = {
  style: BlockStyle;
  children: ReactNode;
  className?: string;
};
/** Applies a block's generic style around its rendered content. */
export declare function Frame({
  style,
  children,
  className,
}: FrameProps): import("react").JSX.Element;
