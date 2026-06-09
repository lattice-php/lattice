/**
 * The signed component reference travels to the server as the `_lattice` query
 * param on GET requests and as the `_lattice` body field on writes. This must
 * match ComponentReferenceSigner::token() on the PHP side, which reads
 * `_lattice` (falling back to the `X-Lattice-Ref` header — a server-side escape
 * hatch no client here produces).
 */
export const LATTICE_REF_PARAM = "_lattice";

export function withRefParam(url: URL, componentRef: string): void {
  if (componentRef) {
    url.searchParams.set(LATTICE_REF_PARAM, componentRef);
  }
}

export function withRefBody<T extends Record<string, unknown>>(data: T, componentRef: string): T {
  return componentRef ? { ...data, [LATTICE_REF_PARAM]: componentRef } : data;
}

export function endpointWithRef(endpoint: string, componentRef: string): string {
  if (!componentRef) {
    return endpoint;
  }

  const url = new URL(endpoint, window.location.origin);

  withRefParam(url, componentRef);

  return `${url.pathname}${url.search}`;
}
