import { BlockTypeData } from "../../types";
/** The block type's fields that are not edited inline, keyed to the rendered block's bindings. */
export declare function useUnboundSchema(id: string, type: BlockTypeData | null): Node[];
export declare function ContentPanel({
  id,
  type,
  data,
}: {
  id: string;
  type: BlockTypeData;
  data: Record<string, unknown>;
}): import("react").JSX.Element;
