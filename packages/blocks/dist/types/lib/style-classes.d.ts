import { BlockBackground, BlockStyle, BlockWidth } from "../types";
export declare const blockWidths: Record<BlockWidth, string>;
export declare const blockBackgrounds: Record<BlockBackground, string>;
/** Classes for the block's outer element: spacing, background, visibility. */
export declare function frameOuterClasses(style: BlockStyle): string;
/** Classes for the block's inner element: the content width. */
export declare function frameInnerClasses(style: BlockStyle): string;
