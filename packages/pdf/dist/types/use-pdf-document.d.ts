import { PDFDocumentProxy } from "pdfjs-dist";
type DocumentSource = {
  url: string;
  cmapUrl: string | null;
  standardFontDataUrl: string | null;
  wasmUrl: string | null;
};
type DocumentState = {
  doc: PDFDocumentProxy | null;
  error: boolean;
};
export declare function usePdfDocument(source: DocumentSource): DocumentState;

