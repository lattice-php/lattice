import type { ComponentPropsMap } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  BlockBackground,
  BlockCategory,
  BlockDocument,
  BlockEditor as BlockEditorWireProps,
  BlockNode,
  BlockNodeType,
  BlockPatternData,
  BlockStyle,
  BlockSupports,
  BlockTypeData,
  BlockWidth,
  FrameClasses,
  SlotData,
  StyleClasses,
} from "./generated";

/** Where a block goes: a slot of a parent block, or the document root when `parentId` is null. */
export type BlockTarget = {
  parentId: string | null;
  slot: string | null;
  index: number;
};

export type BlockErrors = Record<string, Record<string, string[]>>;

/** How wide the editor canvas pretends the viewport is. */
export type CanvasWidth = "desktop" | "tablet" | "mobile";
