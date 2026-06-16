import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@lattice-php/lattice/core/api";

export type BrowserToken = {
  accessToken: string;
  audience: string;
  expiresIn: number;
  scopes: string[];
  tokenType: string;
};

export type BrowserTokenRequest = {
  audience: string | null;
  component: string | null;
  ref: string | null;
  scopes: string[];
  tokenEndpoint: string | null;
};

export function useBrowserToken(request: BrowserTokenRequest): {
  error: string | null;
  loading: boolean;
  token: BrowserToken | null;
} {
  const [token, setToken] = useState<BrowserToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scopesKey = useMemo(() => request.scopes.join(" "), [request.scopes]);

  useEffect(() => {
    if (!request.tokenEndpoint || !request.ref || !request.audience || !request.component) {
      setToken(null);
      setError(null);
      setLoading(false);

      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void apiJson<BrowserToken>(request.tokenEndpoint, {
      method: "POST",
      ref: request.ref,
      body: JSON.stringify({
        component: request.component,
        audience: request.audience,
        scopes: request.scopes,
      }),
    })
      .then((next) => {
        if (!cancelled) {
          setToken(next);
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
  }, [request.audience, request.component, request.ref, request.tokenEndpoint, scopesKey]);

  return { error, loading, token };
}
