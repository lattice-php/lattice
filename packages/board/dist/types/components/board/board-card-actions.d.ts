import { Node } from "@lattice-php/core";
export type BoardCardActionsProps = {
  actions: Node[];
  "data-test"?: string;
};
export declare function BoardCardActions({
  actions,
  "data-test": testId,
}: BoardCardActionsProps): import("react").JSX.Element;
