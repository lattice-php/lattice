import { ReactNode } from "react";
import { EditorEndpoint } from "../../endpoint";
import { EditorState, EditorStore } from "../../document/store";
import { BlockTypeData, StyleClasses } from "../../types";
import { InlineFocus } from "./focus-registry";
import { InsertActions } from "./use-insert";
export type EditorContextValue = InsertActions & {
  store: EditorStore;
  endpoint: EditorEndpoint | null;
  types: readonly BlockTypeData[];
  /** The style vocabulary's classes, so a style edit applies on the canvas without a server render. */
  styleClasses: StyleClasses;
  /** Fetch a fresh render for a block; repeated calls within the debounce window collapse. */
  requestRender: (id: string) => void;
  /** Keep the block element in the DOM map so selection changes can focus it. */
  registerBlock: (id: string, element: HTMLElement | null) => void;
  focusBlock: (id: string) => void;
  /** The inline editors currently mounted, for focus hand-offs between blocks. */
  inline: InlineFocus;
  /** Save the draft right away instead of waiting for the autosave delay. */
  saveNow: () => Promise<void>;
};
export declare function EditorProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: ReactNode;
}): import("react").JSX.Element;
export declare function useEditor(): EditorContextValue;
export declare function useEditorState<T>(selector: (state: EditorState) => T): T;
export declare function useBlockType(type: string): BlockTypeData | null;
/**
 * The block elements on the canvas by id. A block inserted a moment ago has no
 * element until its render arrives, so focusing it waits for the registration.
 */
export declare function useBlockElements(): {
  focusBlock: (id: string) => void;
  registerBlock: (id: string, element: HTMLElement | null) => void;
};
