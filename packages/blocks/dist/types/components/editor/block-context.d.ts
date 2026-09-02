import { ReactNode } from "react";
export type BlockContextValue = {
  id: string;
  type: string;
  /** Lets an inline editor place its formatting controls in the block toolbar. */
  setInlineToolbar: (toolbar: ReactNode) => void;
};
export declare function BlockProvider({
  id,
  type,
  setInlineToolbar,
  children,
}: BlockContextValue & {
  children: ReactNode;
}): import("react").JSX.Element;
/** The block whose render the current node belongs to; null outside the editor canvas. */
export declare function useOptionalBlock(): BlockContextValue | null;
