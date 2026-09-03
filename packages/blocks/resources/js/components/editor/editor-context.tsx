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
import type { BlockTypeData, StyleClasses } from "../../types";
import type { InlineFocus } from "./focus-registry";
import type { InsertActions } from "./use-insert";

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

/**
 * The block elements on the canvas by id. A block inserted a moment ago has no
 * element until its render arrives, so focusing it waits for the registration.
 */
export function useBlockElements() {
  const elements = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<string | null>(null);

  const registerBlock = useCallback((id: string, element: HTMLElement | null) => {
    if (!element) {
      elements.current.delete(id);

      return;
    }

    elements.current.set(id, element);

    if (pendingFocus.current === id) {
      pendingFocus.current = null;
      element.focus({ preventScroll: false });
    }
  }, []);

  const focusBlock = useCallback((id: string) => {
    const element = elements.current.get(id);

    if (element) {
      element.focus({ preventScroll: false });
    } else {
      pendingFocus.current = id;
    }
  }, []);

  return { focusBlock, registerBlock };
}
