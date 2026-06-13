import type { Node } from "@lattice/lattice/core/types";
import { fieldProps } from "./field-props";

export type PrefillTarget = {
  path: string;
  resetOn: string[];
  refreshOn: string[];
};

type Block = { type: string; label: string; schema: Node[] };

const ROW_COLLECTION_TYPES = new Set(["form.builder", "form.repeater"]);

/** Resolve a declared dependency to a concrete store path. */
function mapDep(dep: string, base: string | null, index: number): string {
  if (dep.startsWith("@")) {
    return dep.slice(1);
  }

  return base === null ? dep : `${base}.${index}.${dep}`;
}

function targetFor(node: Node, base: string | null, index: number): PrefillTarget | null {
  const props = fieldProps(node);

  if (!props.prefill || !props.name) {
    return null;
  }

  return {
    path: base === null ? props.name : `${base}.${index}.${props.name}`,
    resetOn: (props.prefillResetOn ?? []).map((dep) => mapDep(dep, base, index)),
    refreshOn: (props.prefillRefreshOn ?? []).map((dep) => mapDep(dep, base, index)),
  };
}

/** Concrete prefill targets for the current schema and row values. */
export function collectPrefillTargets(
  nodes: Node[] | undefined,
  values: Record<string, unknown>,
): PrefillTarget[] {
  const targets: PrefillTarget[] = [];

  const walk = (list: Node[] | undefined): void => {
    for (const node of list ?? []) {
      if (ROW_COLLECTION_TYPES.has(node.type)) {
        const name = fieldProps(node).name;
        if (name) {
          const rows = Array.isArray(values[name])
            ? (values[name] as Array<Record<string, unknown>>)
            : [];
          const blocks = (node as unknown as { blocks?: Block[] }).blocks;

          rows.forEach((row, index) => {
            const template = blocks
              ? (blocks.find((block) => block.type === row.type)?.schema ?? [])
              : (node.schema ?? []);

            for (const child of template) {
              const target = targetFor(child, name, index);
              if (target) {
                targets.push(target);
              }
            }
          });
        }

        continue;
      }

      const target = targetFor(node, null, 0);
      if (target) {
        targets.push(target);
      }

      walk(node.schema);
    }
  };

  walk(nodes);

  return targets;
}

/** Read a value at a dot path (`items.0.price`) from the flat store. */
export function getPath(values: Record<string, unknown>, path: string): unknown {
  let current: unknown = values;

  for (const part of path.split(".")) {
    if (current == null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/** Write a computed value at a dot path via the store's `setValue` (functional for rows). */
export function applyPrefillValue(
  setValue: (name: string, value: unknown) => void,
  path: string,
  value: unknown,
): void {
  const [head, ...rest] = path.split(".");

  if (rest.length === 0) {
    setValue(head, value);

    return;
  }

  const index = Number(rest[0]);
  const field = rest.slice(1).join(".");

  setValue(head, (prev: unknown) => {
    if (!Array.isArray(prev) || prev[index] == null) {
      return prev;
    }

    const rows = [...(prev as Array<Record<string, unknown>>)];
    rows[index] = { ...rows[index], [field]: value };

    return rows;
  });
}

/** Targets whose `resetOn` dependency changed value between two store snapshots. */
export function pathsToClear(
  targets: PrefillTarget[],
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
): string[] {
  return targets
    .filter((target) =>
      target.resetOn.some((dep) => !Object.is(getPath(previous, dep), getPath(next, dep))),
    )
    .map((target) => target.path);
}

/** Targets that already hold a stored value — pre-marked as overridden so a load isn't clobbered. */
export function seededOverrides(
  targets: PrefillTarget[],
  values: Record<string, unknown>,
): string[] {
  return targets
    .filter((target) => {
      const value = getPath(values, target.path);

      return value !== undefined && value !== null && value !== "";
    })
    .map((target) => target.path);
}
