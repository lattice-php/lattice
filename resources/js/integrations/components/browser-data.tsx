import { useEffect, useState } from "react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useBrowserToken } from "../use-browser-token";

type BrowserDataProps = {
  audience?: string | null;
  dataEndpoint?: string | null;
  endpoint?: string | null;
  ref?: string | null;
  resource?: string | null;
  scopes?: string[] | null;
  tokenEndpoint?: string | null;
};

type ExternalPayload = {
  data?: Array<Record<string, unknown>>;
};

function label(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export const BrowserData: RendererComponent<"integration.browser-data"> = ({ node }) => {
  const component = node.id ?? node.key ?? null;
  const props = node.props as BrowserDataProps;
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);
  const { token, loading } = useBrowserToken({
    audience: props.audience ?? null,
    component,
    ref: props.ref ?? null,
    scopes: props.scopes ?? [],
    tokenEndpoint: props.tokenEndpoint ?? props.endpoint ?? null,
  });

  useEffect(() => {
    if (!token || !props.dataEndpoint) {
      return;
    }

    let cancelled = false;
    setError(null);

    void fetch(props.dataEndpoint, {
      headers: {
        Accept: "application/json",
        Authorization: `${token.tokenType} ${token.accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`External data failed (${response.status})`);
        }

        return response.json() as Promise<ExternalPayload>;
      })
      .then((payload) => {
        if (!cancelled) {
          setRows(payload.data ?? []);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.dataEndpoint, token]);

  if (error) {
    return <div className="rounded-lt border border-lt-danger/40 p-3 text-sm">{error}</div>;
  }

  if (loading || !token) {
    return <div className="rounded-lt border border-lt-border p-3 text-sm">Loading...</div>;
  }

  return (
    <div className="rounded-lt border border-lt-border bg-lt-bg">
      <div className="border-b border-lt-border px-3 py-2 text-sm font-medium">
        {props.resource ?? "External data"}
      </div>
      <div className="divide-y divide-lt-border">
        {rows.map((row, index) => (
          <div className="px-3 py-2 text-sm" key={label(row.id) || index}>
            <span className="font-medium">{label(row.name ?? row.id ?? row)}</span>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="px-3 py-2 text-sm text-lt-muted-fg">No data</div>
        ) : null}
      </div>
    </div>
  );
};

export default BrowserData;
