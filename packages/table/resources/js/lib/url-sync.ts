import { appendTableFilterParam } from "./query";

/**
 * The unprefixed params a URL-synced table owns. `tf` is handled separately —
 * every URL param starting with `tf[` belongs to the table's dedicated
 * filters, however many keys they expand to.
 */
export const TABLE_OWNED_QUERY_KEYS = ["filter", "sort", "q", "page", "per_page", "tf"];

/** The unprefixed params a URL-synced board owns. */
export const BOARD_OWNED_QUERY_KEYS = ["q", "tf"];

export type UrlSyncScope = {
  key: string | null;
  ownedKeys: string[];
};

/**
 * Writes a synced component's query onto the page URL via `replaceState` —
 * never `pushState` — so filter changes don't create history entries, exactly
 * like the tabs component's own query sync. Only the scope's owned params are
 * touched; every other param on the page (another component's, or the tabs
 * `tabs` param) survives untouched.
 */
export function writeQueryToUrl(params: Record<string, unknown>, scope: UrlSyncScope): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  for (const name of Array.from(url.searchParams.keys())) {
    if (isOwnedParam(name, scope)) {
      url.searchParams.delete(name);
    }
  }

  for (const [key, value] of Object.entries(params)) {
    appendTableFilterParam(url, scope.key === null ? key : `${scope.key}[${key}]`, value);
  }

  if (url.search === window.location.search) {
    return;
  }

  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function isOwnedParam(name: string, scope: UrlSyncScope): boolean {
  if (scope.key !== null) {
    return name === scope.key || name.startsWith(`${scope.key}[`);
  }

  return scope.ownedKeys.some((owned) => name === owned || name.startsWith(`${owned}[`));
}

const scopeClaimants = new Map<string, Set<string>>();
const warnedScopes = new Set<string>();

/**
 * Registers a mounted synced component against its URL query scope, so two
 * differently-scoped components never fight over the same params — the
 * server can't see page composition, so this is a client-side dev guard only
 * (precedent: the dev warn in `navigation.tsx`). Two instances of the *same*
 * synced definition on one page are unsupported and not warned about here.
 */
export function claimUrlSyncScope(scope: UrlSyncScope, componentId: string): () => void {
  const scopeId = scope.key ?? "";
  const claimants = scopeClaimants.get(scopeId) ?? new Set<string>();

  claimants.add(componentId);
  scopeClaimants.set(scopeId, claimants);

  if (import.meta.env.DEV && claimants.size > 1 && !warnedScopes.has(scopeId)) {
    warnedScopes.add(scopeId);
    console.error(
      scope.key === null
        ? "[Lattice] More than one URL-synced table/board claims the unprefixed query params on this page. Give every synced component but one a distinct urlQueryKey()."
        : `[Lattice] More than one URL-synced table/board claims the "${scope.key}" query scope on this page. Give each a distinct urlQueryKey().`,
    );
  }

  return () => {
    claimants.delete(componentId);

    if (claimants.size === 0) {
      scopeClaimants.delete(scopeId);
    }
  };
}
