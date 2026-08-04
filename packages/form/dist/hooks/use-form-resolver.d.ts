import { Node } from '@lattice-php/core/types';
import { PrefillController } from './prefill-context.js';
type FormResolver = {
    nodes: Record<string, Node>;
    markUserEdit: PrefillController["markUserEdit"];
};
export declare function useFormResolver(action: string, componentRef: string, nodes: Node[] | undefined): FormResolver;
export {};
