/**
 * The signed component reference travels to the server as the `X-Lattice-Ref`
 * request header on every interactive request (GET and writes alike). This must
 * match ComponentReferenceSigner::token() on the PHP side, which reads the same
 * header.
 */
export const LATTICE_REF_HEADER = "X-Lattice-Ref";

export function withRefHeader(componentRef: string): Record<string, string> {
  return componentRef ? { [LATTICE_REF_HEADER]: componentRef } : {};
}
