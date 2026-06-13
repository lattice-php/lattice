import type { Node } from "@lattice-php/lattice/core/types";
import { fieldProps } from "./field-props";
import { buildOverrideKey, rowIdFrom } from "./override-keys";

export type PrefillTarget = {
  path: string;
  overrideKey: string;
  resetOn: string[];
  refreshOn: string[];
};

type PrefillSnapshot = {
  targets: PrefillTarget[];
  values: Record<string, unknown>;
};

type Block = { type: string; label: string; schema: Node[] };

const ROW_COLLECTION_TYPES = new Set(["form.builder", "form.repeater"]);

function mapDep(dep: string, base: string | null, index: number): string {
  if (dep.startsWith("@")) {
    return dep.slice(1);
  }

  return base === null ? dep : `${base}.${index}.${dep}`;
}

function targetFor(
  node: Node,
  base: string | null,
  index = 0,
  row: Record<string, unknown> = {},
): PrefillTarget | null {
  const props = fieldProps(node);

  if (!props.prefill || !props.name) {
    return null;
  }

  const rowId = rowIdFrom(row);

  return {
    path: base === null ? props.name : `${base}.${index}.${props.name}`,
    overrideKey: base === null ? props.name : buildOverrideKey(base, rowId, index, props.name),
    resetOn: (props.prefillResetOn ?? []).map((dep) => mapDep(dep, base, index)),
    refreshOn: (props.prefillRefreshOn ?? []).map((dep) => mapDep(dep, base, index)),
  };
}

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
              const target = targetFor(child, name, index, row);
              if (target) {
                targets.push(target);
              }
            }
          });
        }

        continue;
      }

      const target = targetFor(node, null);
      if (target) {
        targets.push(target);
      }

      walk(node.schema);
    }
  };

  walk(nodes);

  return targets;
}

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

export function pathsToClear(previous: PrefillSnapshot, next: PrefillSnapshot): string[] {
  const previousByKey = new Map(
    previous.targets.map((target) => [target.overrideKey, target] as const),
  );

  return next.targets
    .filter((target) => {
      const previousTarget = previousByKey.get(target.overrideKey);

      return target.resetOn.some((dep, index) => {
        const previousDep = previousTarget?.resetOn[index] ?? dep;

        return !Object.is(getPath(previous.values, previousDep), getPath(next.values, dep));
      });
    })
    .map((target) => target.overrideKey);
}

export function seededOverrides(
  targets: PrefillTarget[],
  values: Record<string, unknown>,
): string[] {
  return targets
    .filter((target) => {
      const value = getPath(values, target.path);

      return value !== undefined && value !== null && value !== "";
    })
    .map((target) => target.overrideKey);
}

export function pruneOverrides(overrides: Set<string>, targets: PrefillTarget[]): Set<string> {
  const liveKeys = new Set(targets.map((target) => target.overrideKey));

  return new Set([...overrides].filter((key) => liveKeys.has(key)));
}
