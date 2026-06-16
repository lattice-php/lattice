import { useEffect, useState } from "react";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { Node, NodeProps, RendererComponent, Schema } from "@lattice-php/lattice/core/types";
import { remoteJson } from "@lattice-php/lattice/core/api";
import type { DataList as DataListProps } from "@lattice-php/lattice/types/generated";

type RemotePayload = {
  data?: Array<Record<string, unknown>>;
};

type RemoteRow = Record<string, unknown>;

type DataBindings = Record<string, string>;

type RemoteDataListProps = DataListProps & {
  schema?: Schema;
};

function label(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dataBindings(value: unknown): DataBindings {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => {
      return typeof entry[1] === "string";
    }),
  );
}

function rowValue(row: RemoteRow, key: string): unknown {
  if (key in row) {
    return row[key];
  }

  return key.split(".").reduce<unknown>((value, segment) => {
    return isRecord(value) ? value[segment] : undefined;
  }, row);
}

function materializeProps(props: unknown, row: RemoteRow): NodeProps {
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

function materializeNode(node: Node, row: RemoteRow): Node {
  return {
    ...node,
    props: materializeProps(node.props, row),
    schema: node.schema?.map((child) => materializeNode(child, row)),
  } as Node;
}

function materializeSchema(schema: Schema | undefined, row: RemoteRow): Schema {
  return schema?.map((node) => materializeNode(node, row)) ?? [];
}

export function RemoteDataList({ props }: { props: RemoteDataListProps }) {
  const [rows, setRows] = useState<RemoteRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.remote || !props.dataEndpoint) {
      setRows([]);
      setLoading(false);

      return;
    }

    let cancelled = false;
    setError(null);
    setLoading(true);

    void remoteJson<RemotePayload>(props.dataEndpoint, { remote: props.remote })
      .then((payload) => {
        if (!cancelled) {
          setRows(payload.data ?? []);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.dataEndpoint, props.remote]);

  if (error) {
    return <div className="rounded-lt border border-lt-danger/40 p-3 text-sm">{error}</div>;
  }

  if (loading || !props.remote) {
    return <div className="rounded-lt border border-lt-border p-3 text-sm">Loading...</div>;
  }

  return (
    <div className="rounded-lt border border-lt-border bg-lt-bg">
      <div className="border-b border-lt-border px-3 py-2 text-sm font-medium">Remote data</div>
      <div className="divide-y divide-lt-border">
        {rows.map((row, index) => {
          return (
            <div className="px-3 py-2" key={label(row.id) || index}>
              <Renderer nodes={materializeSchema(props.schema, row)} />
            </div>
          );
        })}
        {rows.length === 0 ? (
          <div className="px-3 py-2 text-sm text-lt-muted-fg">{props.emptyLabel ?? "No data"}</div>
        ) : null}
      </div>
    </div>
  );
}

export const DataList: RendererComponent<"remote.data-list"> = ({ node }) => {
  return <RemoteDataList props={{ ...node.props, schema: node.schema }} />;
};

export default DataList;
