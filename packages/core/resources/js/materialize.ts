import type { Node, NodeProps, Schema } from "./types";

export type RemoteRow = Record<string, unknown>;

export type DataBindings = Record<string, string>;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function dataBindings(value: unknown): DataBindings {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => {
      return typeof entry[1] === "string";
    }),
  );
}

export function rowValue(row: RemoteRow, key: string): unknown {
  if (key in row) {
    return row[key];
  }

  return key.split(".").reduce<unknown>((value, segment) => {
    return isRecord(value) ? value[segment] : undefined;
  }, row);
}

export function materializeProps(props: unknown, row: RemoteRow): NodeProps {
  if (!isRecord(props)) {
    return {};
  }

  const { dataBindings: bindings, ...materialized } = props;

  for (const [prop, key] of Object.entries(dataBindings(bindings))) {
    const value = rowValue(row, key);

    if (value !== undefined) {
      materialized[prop] = value;
    }
  }

  return materialized;
}

export function materializeNode(node: Node, row: RemoteRow): Node {
  return {
    ...node,
    props: materializeProps(node.props, row),
    schema: node.schema?.map((child) => materializeNode(child, row)),
  } as Node;
}

export function materializeSchema(schema: Schema | undefined, row: RemoteRow): Schema {
  return schema?.map((node) => materializeNode(node, row)) ?? [];
}
