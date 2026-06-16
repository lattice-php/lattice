import { useEffect, useState } from "react";
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
  const { audience, component, ref, scopes, tokenEndpoint } = request;
  const [token, setToken] = useState<BrowserToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenEndpoint || !ref || !audience || !component) {
      setToken(null);
      setError(null);
      setLoading(false);

      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void apiJson<BrowserToken>(tokenEndpoint, {
      method: "POST",
      ref,
      body: JSON.stringify({
        component,
        audience,
        scopes,
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
  }, [audience, component, ref, scopes, tokenEndpoint]);

  return { error, loading, token };
}
