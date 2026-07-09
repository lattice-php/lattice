import { useEffect, useState } from "react";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { RendererComponent, Schema } from "@lattice-php/lattice/core/types";
import { remoteJson } from "@lattice-php/lattice/core/api";
import { materializeSchema, type RemoteRow } from "@lattice-php/lattice/core/materialize";
import type { DataList as DataListProps } from "@lattice-php/lattice/types/generated";
import { useT } from "@lattice-php/lattice/i18n";

type RemotePayload = {
  data?: Array<Record<string, unknown>>;
};

type RemoteDataListProps = DataListProps & {
  schema?: Schema;
};

function label(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function RemoteDataList({ props }: { props: RemoteDataListProps }) {
  const { t } = useT("lattice");
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
    return (
      <div className="rounded-lt border border-lt-border p-3 text-sm">
        {t("common.remote.data-list.loading", "Loading...")}
      </div>
    );
  }

  return (
    <div className="rounded-lt border border-lt-border bg-lt-bg">
      <div className="border-b border-lt-border px-3 py-2 text-sm font-medium">
        {t("common.remote.data-list.title", "Remote data")}
      </div>
      <div className="divide-y divide-lt-border">
        {rows.map((row, index) => {
          return (
            <div className="px-3 py-2" key={label(row.id) || index}>
              <Renderer nodes={materializeSchema(props.schema, row)} />
            </div>
          );
        })}
        {rows.length === 0 ? (
          <div className="px-3 py-2 text-sm text-lt-muted-fg">
            {props.emptyLabel ?? t("common.remote.data-list.empty", "No data")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const DataList: RendererComponent<"remote.data-list"> = ({ node }) => {
  return <RemoteDataList props={{ ...node.props, schema: node.schema }} />;
};

export default DataList;
