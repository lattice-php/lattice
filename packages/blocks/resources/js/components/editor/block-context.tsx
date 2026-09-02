import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

export type BlockContextValue = {
  id: string;
  type: string;
  /** Lets an inline editor place its formatting controls in the block toolbar. */
  setInlineToolbar: (toolbar: ReactNode) => void;
};

const BlockContext = createContext<BlockContextValue | null>(null);

export function BlockProvider({
  id,
  type,
  setInlineToolbar,
  children,
}: BlockContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ id, setInlineToolbar, type }), [id, setInlineToolbar, type]);

  return <BlockContext.Provider value={value}>{children}</BlockContext.Provider>;
}

/** The block whose render the current node belongs to; null outside the editor canvas. */
export function useOptionalBlock(): BlockContextValue | null {
  return useContext(BlockContext);
}
