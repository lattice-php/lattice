import { Node } from '@lattice-php/core/types';
type PrefillTarget = {
    path: string;
    overrideKey: string;
    resetOn: string[];
    refreshOn: string[];
};
type PrefillSnapshot = {
    targets: PrefillTarget[];
    values: Record<string, unknown>;
};
export { getPath } from './form-path.js';
export declare function collectPrefillTargets(nodes: Node[] | undefined, values: Record<string, unknown>): PrefillTarget[];
export declare function pathsToClear(previous: PrefillSnapshot, next: PrefillSnapshot): string[];
export declare function seededOverrides(targets: PrefillTarget[], values: Record<string, unknown>): string[];
export declare function pruneOverrides(overrides: Set<string>, targets: PrefillTarget[]): Set<string>;
