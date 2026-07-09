import type { Node } from "@lattice-php/lattice/core/types";
import { fieldProps } from "./field-props";
import { appendPath, getPath } from "./form-path";
import { buildOverrideKey, rowIdFrom } from "./override-keys";

type PrefillTarget = {
  path: string;
  overrideKey: string;
  resetOn: string[];
  refreshOn: string[];
};

type PrefillSnapshot = {
  targets: PrefillTarget[];
  values: Record<string, unknown>;
};

type RowTemplate = { type: string; label: string; schema: Node[] };

const ROW_COLLECTION_TYPES = new Set(["field.builder", "field.repeater"]);

/**
 * Registers a custom node type as a row collection so the prefill walker
 * recurses into its rows. Call once at module scope from the package or app
 * that ships the field.
 */
export function registerRowCollectionType(type: string): void {
  ROW_COLLECTION_TYPES.add(type);
}

export { getPath } from "./form-path";

function mapDep(dep: string, rowPath: string | null): string {
  if (dep.startsWith("@")) {
    return dep.slice(1);
  }

  return rowPath === null ? dep : appendPath(rowPath, dep);
}

function targetFor(
  node: Node,
  rowPath: string | null,
  identityCollectionPath: string | null,
  index = 0,
  row: Record<string, unknown> = {},
): PrefillTarget | null {
  const props = fieldProps(node);

  if (!props.editablePrefill || !props.name) {
    return null;
  }

  const rowId = rowIdFrom(row);

  return {
    path: rowPath === null ? props.name : appendPath(rowPath, props.name),
    overrideKey:
      identityCollectionPath === null
        ? props.name
        : buildOverrideKey(identityCollectionPath, rowId, index, props.name),
    resetOn: (props.prefillResetOn ?? []).map((dep) => mapDep(dep, rowPath)),
    refreshOn: (props.prefillRefreshOn ?? []).map((dep) => mapDep(dep, rowPath)),
  };
}

export function collectPrefillTargets(
  nodes: Node[] | undefined,
  values: Record<string, unknown>,
): PrefillTarget[] {
  const targets: PrefillTarget[] = [];

  const walk = (
    list: Node[] | undefined,
    rowPath: string | null = null,
    identityRowPath: string | null = null,
    identityCollectionPath: string | null = null,
    index = 0,
    row: Record<string, unknown> = {},
  ): void => {
    for (const node of list ?? []) {
      if (ROW_COLLECTION_TYPES.has(node.type)) {
        const name = fieldProps(node).name;
        if (name) {
          const childCollectionPath = appendPath(rowPath, name);
          const childIdentityCollectionPath = appendPath(identityRowPath, name);
          const storedRows = getPath(values, childCollectionPath);
          const rows = Array.isArray(storedRows)
            ? (storedRows as Array<Record<string, unknown>>)
            : [];
          const templates = (node as unknown as { templates?: RowTemplate[] }).templates;

          rows.forEach((childRow, childIndex) => {
            const template = templates
              ? (templates.find((t) => t.type === childRow.type)?.schema ?? [])
              : (node.schema ?? []);

            walk(
              template,
              appendPath(childCollectionPath, childIndex),
              appendPath(childIdentityCollectionPath, rowIdFrom(childRow) ?? childIndex),
              childIdentityCollectionPath,
              childIndex,
              childRow,
            );
          });
        }

        continue;
      }

      const target = targetFor(node, rowPath, identityCollectionPath, index, row);
      if (target) {
        targets.push(target);
      }

      walk(node.schema, rowPath, identityRowPath, identityCollectionPath, index, row);
    }
  };

  walk(nodes);

  return targets;
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
