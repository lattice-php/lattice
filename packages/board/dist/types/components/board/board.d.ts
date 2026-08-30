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
  query: BoardWireProps["query"];
  queryKey: BoardWireProps["queryKey"];
  result: BoardResult | null;
  schema: Schema;
  searchable: boolean;
  syncQuery: BoardWireProps["syncQuery"];
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
  query,
  queryKey,
  result,
  schema,
  searchable,
  syncQuery,
}: BoardProps): import("react").JSX.Element;
