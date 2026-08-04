/**
 * The signed component reference travels to the server as the `X-Lattice-Ref`
 * request header on every interactive request (GET and writes alike). This must
 * match ComponentReferenceSigner::token() on the PHP side, which reads the same
 * header.
 */
export declare const LATTICE_REF_HEADER = "X-Lattice-Ref";
export declare function latestRef(componentRef: string): string;
export declare function storeRefreshedRef(componentRef: string, refreshed: string): void;
export declare function clearRefreshedRefs(): void;
export declare function withRefHeader(componentRef: string): Record<string, string>;
