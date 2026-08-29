import { Schema } from "@lattice-php/core";
import { BoardColumnData, BoardResult } from "../../generated";
export type BoardProps = {
  columns: BoardColumnData[];
  componentRef: string | null;
  "data-test"?: string;
  endpoint: string | null;
  identity?: string;
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
  perColumn,
  result,
  schema,
}: BoardProps): import("react").JSX.Element;
