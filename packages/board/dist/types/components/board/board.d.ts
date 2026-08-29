import { Schema } from "@lattice-php/core";
import { Board as BoardWireProps, BoardColumnData, BoardResult } from "../../generated";
export type BoardProps = {
  columns: BoardColumnData[];
  componentRef: string | null;
  "data-test"?: string;
  endpoint: string | null;
  identity?: string;
  moveAction: BoardWireProps["moveAction"];
  perColumn: number;
  result: BoardResult | null;
  schema: Schema;
};
export declare function Board({
  columns,
  componentRef,
  "data-test": testId,
  endpoint,
  identity,
  moveAction,
  perColumn,
  result,
  schema,
}: BoardProps): import("react").JSX.Element;
