import type { Node } from "@lattice-php/lattice/core/types";
import { walkFields } from "./field-props";

export type CollectedFields = {
  labels: Record<string, string>;
  values: Record<string, unknown>;
};

/** Gather the initial label and value of every named field in a schema. */
export function collectFields(nodes: Node[] | undefined): CollectedFields {
  const collected: CollectedFields = { labels: {}, values: {} };

  walkFields(nodes, (props) => {
    if (!props.name) {
      return;
    }
    if (props.label) {
      collected.labels[props.name] = props.label;
    }
    if (props.value !== undefined) {
      collected.values[props.name] = props.value;
    }
  });

  return collected;
}
