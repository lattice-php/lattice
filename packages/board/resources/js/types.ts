import type { ComponentPropsMap } from "./generated";

declare module "@lattice-php/core" {
  interface ComponentProps extends ComponentPropsMap {}
}

export type {
  Board as BoardWireProps,
  BoardColumnCards,
  BoardColumnData,
  BoardNodeType,
  BoardQuery,
  BoardResult,
} from "./generated";
