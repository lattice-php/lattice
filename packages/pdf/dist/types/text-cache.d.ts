import { PDFDocumentProxy } from 'pdfjs-dist';
import { TextContent } from 'pdfjs-dist/types/src/display/api';
export type PageText = {
    content: TextContent;
    items: string[];
};
export type PageTextCache = {
    numPages: number;
    get(page: number): Promise<PageText>;
};
export declare function createPageTextCache(doc: PDFDocumentProxy): PageTextCache;
