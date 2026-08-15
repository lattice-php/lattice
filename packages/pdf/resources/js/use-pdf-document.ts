import { useEffect, useState } from "react";
import { getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

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

export function usePdfDocument(source: DocumentSource): DocumentState {
  const [state, setState] = useState<DocumentState>({ doc: null, error: false });

  useEffect(() => {
    setState({ doc: null, error: false });

    const task = getDocument({
      url: source.url,
      ...(source.cmapUrl ? { cMapUrl: source.cmapUrl, cMapPacked: true } : {}),
      ...(source.standardFontDataUrl ? { standardFontDataUrl: source.standardFontDataUrl } : {}),
      ...(source.wasmUrl ? { wasmUrl: source.wasmUrl } : {}),
    });
    let destroyed = false;

    task.promise.then(
      (doc) => {
        if (!destroyed) {
          setState({ doc, error: false });
        }
      },
      () => {
        if (!destroyed) {
          setState({ doc: null, error: true });
        }
      },
    );

    return () => {
      destroyed = true;
      void task.destroy();
    };
  }, [source.url, source.cmapUrl, source.standardFontDataUrl, source.wasmUrl]);

  return state;
}
