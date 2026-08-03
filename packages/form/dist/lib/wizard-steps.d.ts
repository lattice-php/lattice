import { Node } from '@lattice-php/core/types';
export declare function stepFieldNames(step: Node): string[];
export declare function stepValidationPaths(step: Node): string[];
export declare function stepsWithErrors(stepNames: string[][], errors: Record<string, string | undefined>): Set<number>;
export declare function firstErroredStep(stepNames: string[][], errors: Record<string, string | undefined>): number | null;
