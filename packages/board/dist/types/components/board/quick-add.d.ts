import { Board as BoardWireProps } from "../../generated";
export type QuickAddProps = {
  columnKey: string;
  createAction: BoardWireProps["createAction"];
  onCreated: () => void;
};
export declare function QuickAdd({
  columnKey,
  createAction,
  onCreated,
}: QuickAddProps): import("react").JSX.Element | null;
