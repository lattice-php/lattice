import { Node } from "@lattice-php/core";
import { Gap, TextAlign } from "@lattice-php/ui";
export type BlockBackground = "none" | "muted" | "inverted" | "primary";
export type BlockCategory = "text" | "media" | "layout" | "embed";
export type BlockDocument = {
  readonly blocks: BlockNode[];
  readonly version: number;
};
export type BlockEditor = {
  document: BlockDocument;
  endpoint: string | null;
  patterns: BlockPatternData[];
  previewUrl: string | null;
  ref: string | null;
  rendered: Record<string, Node>;
  revision: number;
  title: string | null;
  types: BlockTypeData[];
};
export type BlockFrame = {
  blockId: string;
  blockType: string;
  style: BlockStyle;
  supports: BlockSupports;
};
export type BlockNode = {
  readonly data: Record<string, unknown>;
  readonly id: string;
  readonly slots: Record<string, BlockNode[]>;
  readonly style: BlockStyle;
  readonly type: string;
};
export type BlockNodeType =
  | "blocks.editor"
  | "blocks.frame"
  | "blocks.rich-text"
  | "blocks.slot"
  | "blocks.unknown"
  | "blocks.view";
export type BlockPatternData = {
  readonly blocks: BlockNode[];
  readonly description: string | null;
  readonly icon: string | null;
  readonly key: string;
  readonly label: string;
};
export type BlockStyle = {
  readonly align: TextAlign | null;
  readonly anchor: string | null;
  readonly background: BlockBackground | null;
  readonly hideOnDesktop: boolean;
  readonly hideOnMobile: boolean;
  readonly marginBottom: Gap | null;
  readonly marginTop: Gap | null;
  readonly paddingBottom: Gap | null;
  readonly paddingTop: Gap | null;
  readonly width: BlockWidth | null;
};
export type BlockSupports = {
  readonly align: boolean;
  readonly anchor: boolean;
  readonly background: boolean;
  readonly spacing: boolean;
  readonly visibility: boolean;
  readonly width: boolean;
};
export type BlockTypeData = {
  readonly category: string;
  readonly defaults: Record<string, unknown>;
  readonly description: string | null;
  readonly icon: string | null;
  readonly keywords: string[];
  readonly label: string;
  readonly schema: Node[];
  readonly slots: SlotData[];
  readonly supports: BlockSupports;
  readonly type: string;
};
export type BlockView = Record<string, never>;
export type BlockWidth = "content" | "wide" | "full";
export type ComponentPropsMap = {
  "blocks.editor": BlockEditor;
  "blocks.frame": BlockFrame;
  "blocks.rich-text": RichText;
  "blocks.slot": SlotOutlet;
  "blocks.unknown": UnknownBlock;
  "blocks.view": BlockView;
};
export type RichText = {
  document: Record<string, unknown> | null;
  html: string;
  placeholder: string | null;
};
export type SlotData = {
  readonly allows: string[] | null;
  readonly label: string;
  readonly max: number | null;
  readonly min: number | null;
  readonly name: string;
};
export type SlotOutlet = {
  allows: string[] | null;
  blockId: string;
  label: string;
  max: number | null;
  min: number | null;
  name: string;
};
export type UnknownBlock = {
  blockType: string;
};
