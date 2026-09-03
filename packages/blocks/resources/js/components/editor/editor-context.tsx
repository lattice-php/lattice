import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { EditorEndpoint } from "../../endpoint";
import type { EditorState, EditorStore } from "../../document/store";
import type { BlockTypeData } from "../../types";
import type { InlineFocus } from "./focus-registry";

export type EditorContextValue = {
  store: EditorStore;
  endpoint: EditorEndpoint | null;
  types: readonly BlockTypeData[];
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

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: ReactNode;
}) {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("Block editor components must render inside <EditorProvider>.");
  }

  return context;
}

export function useEditorState<T>(selector: (state: EditorState) => T): T {
  const { store } = useEditor();
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const read = useCallback(() => selectorRef.current(store.getState()), [store]);

  return useSyncExternalStore(store.subscribe, read, read);
}

export function useBlockType(type: string): BlockTypeData | null {
  const { types } = useEditor();

  return useMemo(() => types.find((candidate) => candidate.type === type) ?? null, [type, types]);
}

export function useBlockElements() {
  const elements = useRef(new Map<string, HTMLElement>());

  const registerBlock = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      elements.current.set(id, element);
    } else {
      elements.current.delete(id);
    }
  }, []);

  const focusBlock = useCallback((id: string) => {
    elements.current.get(id)?.focus({ preventScroll: false });
  }, []);

  return { focusBlock, registerBlock };
}
