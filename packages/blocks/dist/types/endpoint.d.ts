import { Node } from '@lattice-php/core';
import { BlockDocument, BlockErrors, BlockNode } from './types';
export type EditorEndpoint = {
    url: string;
    ref: string;
};
export type RenderResult = {
    node: Node;
    errors: Record<string, string[]>;
};
export type SaveResult = {
    status: "saved";
    revision: number;
    errors: BlockErrors;
} | {
    status: "conflict";
    revision: number;
} | {
    status: "invalid";
    errors: BlockErrors;
} | {
    status: "failed";
    httpStatus: number;
};
export declare function renderBlock(endpoint: EditorEndpoint, block: BlockNode): Promise<RenderResult | null>;
export declare function saveDraft(endpoint: EditorEndpoint, document: BlockDocument, revision: number, keepalive?: boolean): Promise<SaveResult>;
export declare function publishDocument(endpoint: EditorEndpoint, document: BlockDocument, revision: number): Promise<SaveResult>;
