import { ComponentType } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
export declare const PDF_PAGE_LAYER_EXTENSION = "pdf.page-layer";
/** The rendered page geometry in CSS pixels, as pdf.js reports it for the current zoom. */
export type PdfPageViewport = {
    scale: number;
    rotation: number;
    width: number;
    height: number;
};
/**
 * A page layer mounts over every rendered page, above the canvas and the
 * text layer, sized to the page. Its container ignores pointer events so the
 * text stays selectable; a layer opts its own elements back in.
 *
 * This contract is an early seam for selection and annotation tooling and
 * may grow (coordinate transforms, page text, region rendering).
 */
export type PdfPageLayerProps = {
    doc: PDFDocumentProxy;
    page: PDFPageProxy;
    pageNumber: number;
    viewport: PdfPageViewport;
};
export type PdfPageLayerComponent = ComponentType<PdfPageLayerProps>;
export type PdfPageLayerRegistry = Record<string, PdfPageLayerComponent>;
export declare function usePdfPageLayerRegistry(): PdfPageLayerRegistry;
