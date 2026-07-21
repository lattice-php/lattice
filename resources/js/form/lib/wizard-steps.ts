import type { Node } from "@lattice-php/lattice/core/types";
import { fieldProps } from "./field-props";

const ROW_FIELD_TYPES = new Set(["field.builder", "field.repeater"]);

export function stepFieldNames(step: Node): string[] {
  const names: string[] = [];

  const collect = (node: Node): void => {
    const name = fieldProps(node).name;

    if (name) {
      names.push(name);
    }
    if (name && ROW_FIELD_TYPES.has(node.type)) {
      return;
    }
    for (const child of node.schema ?? []) {
      collect(child);
    }
  };

  for (const child of step.schema ?? []) {
    collect(child);
  }

  return names;
}

export function stepValidationPaths(step: Node): string[] {
  const paths: string[] = [];

  const expand = (node: Node): void => {
    const name = fieldProps(node).name;

    if (name) {
      paths.push(name, `${name}.*`);
    }

    if (name && ROW_FIELD_TYPES.has(node.type)) {
      for (const child of stepFieldNames(node)) {
        paths.push(`${name}.*.${child}`);
      }

      return;
    }

    for (const child of node.schema ?? []) {
      expand(child);
    }
  };

  for (const child of step.schema ?? []) {
    expand(child);
  }

  return paths;
}

export function stepsWithErrors(
  stepNames: string[][],
  errors: Record<string, string | undefined>,
): Set<number> {
  const keys = Object.keys(errors).filter((key) => Boolean(errors[key]));
  const owners = new Set<number>();

  stepNames.forEach((names, index) => {
    const owns = keys.some((key) =>
      names.some((name) => key === name || key.startsWith(`${name}.`)),
    );

    if (owns) {
      owners.add(index);
    }
  });

  return owners;
}

export function firstErroredStep(
  stepNames: string[][],
  errors: Record<string, string | undefined>,
): number | null {
  const owners = stepsWithErrors(stepNames, errors);

  return owners.size > 0 ? Math.min(...owners) : null;
}
