export type ComponentPropsMap = {
  pdf: PdfViewer;
};
export type NodeType = "pdf";
export type PdfNodeType = "pdf";
export type PdfViewer = {
  cmapUrl: string | null;
  downloadable: boolean;
  filename: string | null;
  height: number;
  initialZoom: number | null;
  maxHeight: number | null;
  searchable: boolean;
  sidebar: boolean;
  standardFontDataUrl: string | null;
  url: string;
  wasmUrl: string | null;
  workerUrl: string;
};
