export declare function appendPath(base: string | null | undefined, ...parts: Array<string | number>): string;
export declare function toHtmlName(path: string): string;
export declare function getPath(values: Record<string, unknown>, path: string): unknown;
export declare function setPath(values: Record<string, unknown>, path: string, value: unknown): Record<string, unknown>;
