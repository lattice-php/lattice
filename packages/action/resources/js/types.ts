import type { NodeUnionOf } from "@lattice-php/core";
import type { ActionNodeType, ComponentPropsMap } from "@lattice-php/action/generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  Action,
  ActionGroup,
  ActionNodeType,
  ActionResult,
  BulkAction,
  Confirmation,
} from "@lattice-php/action/generated";

export type ActionNode = NodeUnionOf<ActionNodeType>;
