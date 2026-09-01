export type ComponentPropsMap = {
    pdf: PdfViewer;
};
export type PdfNodeType = "pdf";
export type PdfViewer = {
    cmapUrl: string | null;
    downloadable: boolean;
    filename: string | null;
    height: string;
    initialZoom: number | null;
    maxHeight: string | null;
    searchable: boolean;
    sidebar: boolean;
    standardFontDataUrl: string | null;
    url: string;
    wasmUrl: string | null;
    workerUrl: string;
};
