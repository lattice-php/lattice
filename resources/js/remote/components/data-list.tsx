import { useEffect, useState } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { remoteJson } from "@lattice-php/lattice/core/api";
import type { DataList as DataListProps } from "@lattice-php/lattice/types/generated";

type RemotePayload = {
  data?: Array<Record<string, unknown>>;
};

function label(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function rowValue(row: Record<string, unknown>, key: string | null | undefined): string {
  if (!key) {
    return "";
  }

  return label(row[key]);
}

export function RemoteDataList({ props }: { props: DataListProps }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
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

  const titleKey = props.titleKey ?? "name";
  const subtitleKey = props.subtitleKey;

  return (
    <div className="rounded-lt border border-lt-border bg-lt-bg">
      <div className="border-b border-lt-border px-3 py-2 text-sm font-medium">Remote data</div>
      <div className="divide-y divide-lt-border">
        {rows.map((row, index) => {
          const title = rowValue(row, titleKey) || label(row.id ?? row);
          const subtitle = rowValue(row, subtitleKey);

          return (
            <div className="px-3 py-2 text-sm" key={label(row.id) || index}>
              <div className="font-medium">{title}</div>
              {subtitle !== "" ? <div className="text-xs text-lt-muted-fg">{subtitle}</div> : null}
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
  return <RemoteDataList props={node.props} />;
};

export default DataList;
