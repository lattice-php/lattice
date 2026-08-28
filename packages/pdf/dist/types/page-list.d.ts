import { Ref, RefObject } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { SearchState } from './use-search';
import { PageTextCache } from './text-cache';
export type PageListHandle = {
    scrollToPage(page: number): void;
};
type PageListProps = {
    ref: Ref<PageListHandle>;
    scrollRootRef: RefObject<HTMLDivElement | null>;
    doc: PDFDocumentProxy;
    scale: number;
    baseSize: {
        width: number;
        height: number;
    };
    textCache: PageTextCache;
    search: SearchState;
    onVisiblePageChange(page: number): void;
};
export declare function PageList({ ref, scrollRootRef, doc, scale, baseSize, textCache, search, onVisiblePageChange, }: PageListProps): React.ReactElement;
export {};
