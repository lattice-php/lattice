export type RichDocument = Record<string, unknown>;
type RichNode = {
    type?: string;
    content?: RichNode[];
    text?: string;
};
/** A document that holds nothing a reader would notice: no nodes, or one empty paragraph. */
export declare function isEmptyDocument(document: RichDocument | null | undefined): boolean;
export declare function textDocument(text: string): RichDocument | null;
/** The top-level nodes of a document, ready to append to another one. */
export declare function documentContent(document: RichDocument | null | undefined): RichNode[];
export {};
