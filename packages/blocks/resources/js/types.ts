import type { ComponentPropsMap } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  BlockBackground,
  BlockCategory,
  BlockDocument,
  BlockEditor as BlockEditorWireProps,
  BlockFrame as BlockFrameWireProps,
  BlockNode,
  BlockNodeType,
  BlockStyle,
  BlockSupports,
  BlockTypeData,
  BlockWidth,
  SlotData,
  SlotOutlet as SlotOutletWireProps,
  UnknownBlock as UnknownBlockWireProps,
} from "./generated";

/** Where a block goes: a slot of a parent block, or the document root when `parentId` is null. */
export type BlockTarget = {
  parentId: string | null;
  slot: string | null;
  index: number;
};

export type BlockErrors = Record<string, Record<string, string[]>>;
