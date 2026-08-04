/**
 * The signed component reference travels to the server as the `X-Lattice-Ref`
 * request header on every interactive request (GET and writes alike). This must
 * match ComponentReferenceSigner::token() on the PHP side, which reads the same
 * header.
 */
export const LATTICE_REF_HEADER = "X-Lattice-Ref";

/**
 * Refs are sealed with a lifetime and baked into node props at render time, so
 * a long-lived tab cannot pick up a renewed token through React state. Renewed
 * tokens are instead kept here, keyed by the original prop value, and resolved
 * whenever a ref travels — every consumer keeps passing the ref it was rendered
 * with.
 */
const refreshedRefs = new Map<string, string>();

export function latestRef(componentRef: string): string {
  return refreshedRefs.get(componentRef) ?? componentRef;
}

export function storeRefreshedRef(componentRef: string, refreshed: string): void {
  refreshedRefs.set(componentRef, refreshed);
}

export function clearRefreshedRefs(): void {
  refreshedRefs.clear();
}

export function withRefHeader(componentRef: string): Record<string, string> {
  const ref = latestRef(componentRef);

  return ref ? { [LATTICE_REF_HEADER]: ref } : {};
}
