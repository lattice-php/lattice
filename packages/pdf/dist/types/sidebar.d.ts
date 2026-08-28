import { PDFDocumentProxy } from 'pdfjs-dist';
type SidebarProps = {
    doc: PDFDocumentProxy;
    baseSize: {
        width: number;
        height: number;
    };
    currentPage: number;
    onSelectPage(page: number): void;
};
export declare function Sidebar({ doc, baseSize, currentPage, onSelectPage, }: SidebarProps): React.ReactElement;
export {};
