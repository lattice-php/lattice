export type AccessTokenRequest = { scopes: string[]; forceRefresh: boolean };

export type ResolvedAccessToken = string | { accessToken: string; expiresIn?: number };

/**
 * Standalone hosts (no Lattice backend) supply this to let the playground
 * fetch scoped access tokens lazily on execute. Return `expiresIn` to opt in
 * to the playground's per-scope-set cache; a plain string is never cached, so
 * the host owns reuse. `forceRefresh` marks the single retry after a 401.
 */
export type ResolveAccessToken = (request: AccessTokenRequest) => Promise<ResolvedAccessToken>;

type TokenResolver = (request: AccessTokenRequest) => Promise<string>;

const EXPIRY_SKEW_MS = 30_000;

export function cachedAccessTokens(resolve: ResolveAccessToken): TokenResolver {
  const cache = new Map<string, { accessToken: string; expiresAt: number }>();
  const pending = new Map<string, Promise<string>>();

  return async ({ scopes, forceRefresh }) => {
    const key = [...scopes].sort().join(" ");

    if (forceRefresh) {
      cache.delete(key);
    } else {
      const cached = cache.get(key);

      if (cached && cached.expiresAt > Date.now() + EXPIRY_SKEW_MS) {
        return cached.accessToken;
      }

      const inflight = pending.get(key);

      if (inflight) {
        return inflight;
      }
    }

    const request = resolve({ scopes: [...scopes], forceRefresh })
      .then((resolved) => {
        if (typeof resolved === "string") {
          return resolved;
        }

        if (resolved.expiresIn !== undefined) {
          cache.set(key, {
            accessToken: resolved.accessToken,
            expiresAt: Date.now() + Math.max(0, resolved.expiresIn) * 1000,
          });
        }

        return resolved.accessToken;
      })
      .finally(() => pending.delete(key));

    pending.set(key, request);

    return request;
  };
}
