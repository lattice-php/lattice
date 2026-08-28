import { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
export type LinkOverlay = {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    url: string | null;
    page: number | null;
};
export declare function resolveLinkOverlays(doc: PDFDocumentProxy, page: PDFPageProxy, viewport: PageViewport): Promise<LinkOverlay[]>;
