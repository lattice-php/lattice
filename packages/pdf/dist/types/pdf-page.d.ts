import { PDFDocumentProxy } from 'pdfjs-dist';
import { SearchMatch } from './search';
import { PageTextCache } from './text-cache';
type PdfPageProps = {
    doc: PDFDocumentProxy;
    layers: string[];
    pageNumber: number;
    scale: number;
    textCache: PageTextCache;
    matches: SearchMatch[];
    currentStart: number | null;
    onNavigateToPage(page: number): void;
};
export declare function PdfPage({ doc, layers, pageNumber, scale, textCache, matches, currentStart, onNavigateToPage, }: PdfPageProps): React.ReactElement;
export {};
