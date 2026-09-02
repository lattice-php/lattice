import { ReactNode } from "react";
import { EditorEndpoint } from "../../endpoint";
import { EditorState, EditorStore } from "../../document/store";
import { BlockTypeData } from "../../types";
export type EditorContextValue = {
  store: EditorStore;
  endpoint: EditorEndpoint | null;
  types: readonly BlockTypeData[];
  /** Fetch a fresh render for a block; repeated calls within the debounce window collapse. */
  requestRender: (id: string) => void;
  /** Keep the block element in the DOM map so selection changes can focus it. */
  registerBlock: (id: string, element: HTMLElement | null) => void;
  focusBlock: (id: string) => void;
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
export declare function useBlockElements(): {
  focusBlock: (id: string) => void;
  registerBlock: (id: string, element: HTMLElement | null) => void;
};
