import { Schema } from "@lattice-php/core";
import { FilterNode } from "@lattice-php/table";
import { Board as BoardWireProps, BoardColumnData, BoardResult } from "../../generated";
export type BoardProps = {
  cardAction: BoardWireProps["cardAction"];
  columns: BoardColumnData[];
  componentRef: string | null;
  createAction: BoardWireProps["createAction"];
  "data-test"?: string;
  endpoint: string | null;
  filters: FilterNode[];
  identity?: string;
  moveAction: BoardWireProps["moveAction"];
  perColumn: number;
  result: BoardResult | null;
  schema: Schema;
  searchable: boolean;
};
export declare function Board({
  cardAction,
  columns,
  componentRef,
  createAction,
  "data-test": testId,
  endpoint,
  filters,
  identity,
  moveAction,
  perColumn,
  result,
  schema,
  searchable,
}: BoardProps): import("react").JSX.Element;
